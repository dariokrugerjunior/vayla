package service

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"regexp"
	"strings"

	"multi-tennet/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

var (
	validStoreIDPattern = regexp.MustCompile(`^[0-9]+$`)
	allowedContexts     = map[string]bool{
		"logo":       true,
		"banner":     true,
		"products":   true,
		"categories": true,
		"gallery":    true,
	}
	allowedImageMIMEs = map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
		"image/gif":  true,
	}
	allowedImageExts = map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}
	mimeToExt = map[string]string{
		"image/jpeg": ".jpg",
		"image/png":  ".png",
		"image/webp": ".webp",
		"image/gif":  ".gif",
	}
)

type StorageService interface {
	UploadImage(ctx context.Context, input UploadImageInput) (*UploadImageOutput, error)
	DeleteImage(ctx context.Context, key string) error
	BuildObjectKey(storeID string, contextName string, extension string) (string, error)
	BuildPublicURL(key string) string
}

type UploadImageInput struct {
	File         multipart.File
	OriginalName string
	StoreID      string
	ContextName  string
	Size         int64
}

type UploadImageOutput struct {
	Key          string `json:"key"`
	URL          string `json:"url"`
	OriginalName string `json:"originalName"`
	FileName     string `json:"fileName"`
	ContentType  string `json:"contentType"`
	Size         int64  `json:"size"`
}

type OracleObjectStorageService struct {
	client        *s3.Client
	bucket        string
	namespace     string
	region        string
	s3Endpoint    string
	maxFileSize   int64
	publicBaseURL string
}

func NewOracleObjectStorageService(ctx context.Context, cfg config.StorageConfig) (*OracleObjectStorageService, error) {
	if strings.TrimSpace(cfg.OracleS3Endpoint) == "" {
		return nil, fmt.Errorf("missing ORACLE_S3_ENDPOINT")
	}
	if strings.TrimSpace(cfg.OracleAccessKeyID) == "" {
		return nil, fmt.Errorf("missing ORACLE_ACCESS_KEY_ID")
	}
	if strings.TrimSpace(cfg.OracleSecretAccessKey) == "" {
		return nil, fmt.Errorf("missing ORACLE_SECRET_ACCESS_KEY")
	}
	if strings.TrimSpace(cfg.OracleBucketName) == "" {
		return nil, fmt.Errorf("missing ORACLE_BUCKET_NAME")
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(
		ctx,
		awsconfig.WithRegion(strings.TrimSpace(cfg.OracleRegion)),
		awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				strings.TrimSpace(cfg.OracleAccessKeyID),
				strings.TrimSpace(cfg.OracleSecretAccessKey),
				"",
			),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	endpoint := strings.TrimSpace(cfg.OracleS3Endpoint)
	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(endpoint)
	})

	return &OracleObjectStorageService{
		client:        client,
		bucket:        strings.TrimSpace(cfg.OracleBucketName),
		namespace:     strings.TrimSpace(cfg.OracleNamespace),
		region:        strings.TrimSpace(cfg.OracleRegion),
		s3Endpoint:    endpoint,
		maxFileSize:   cfg.MaxFileSize,
		publicBaseURL: strings.TrimSpace(cfg.OraclePublicBaseURL),
	}, nil
}

func (s *OracleObjectStorageService) UploadImage(ctx context.Context, input UploadImageInput) (*UploadImageOutput, error) {
	if input.File == nil {
		return nil, fmt.Errorf("arquivo obrigatorio")
	}
	if strings.TrimSpace(input.StoreID) == "" {
		return nil, fmt.Errorf("store_id obrigatorio")
	}
	if strings.TrimSpace(input.ContextName) == "" {
		return nil, fmt.Errorf("contexto obrigatorio")
	}
	if input.Size <= 0 {
		return nil, fmt.Errorf("arquivo obrigatorio")
	}
	if s.maxFileSize > 0 && input.Size > s.maxFileSize {
		return nil, fmt.Errorf("arquivo excede tamanho maximo de %d bytes", s.maxFileSize)
	}

	contextName, err := normalizeContext(input.ContextName)
	if err != nil {
		return nil, err
	}

	reader := io.Reader(input.File)
	if s.maxFileSize > 0 {
		reader = io.LimitReader(input.File, s.maxFileSize+1)
	}
	raw, err := io.ReadAll(reader)
	if err != nil {
		return nil, fmt.Errorf("ler arquivo: %w", err)
	}
	if int64(len(raw)) <= 0 {
		return nil, fmt.Errorf("arquivo obrigatorio")
	}
	if s.maxFileSize > 0 && int64(len(raw)) > s.maxFileSize {
		return nil, fmt.Errorf("arquivo excede tamanho maximo de %d bytes", s.maxFileSize)
	}

	contentType := http.DetectContentType(raw)
	if !allowedImageMIMEs[contentType] {
		return nil, fmt.Errorf("apenas imagens sao permitidas")
	}

	ext := strings.ToLower(filepath.Ext(strings.TrimSpace(input.OriginalName)))
	if !allowedImageExts[ext] {
		ext = mimeToExt[contentType]
	}
	if !allowedImageExts[ext] {
		return nil, fmt.Errorf("extensao de imagem nao suportada")
	}

	key, err := s.BuildObjectKey(input.StoreID, contextName, ext)
	if err != nil {
		return nil, err
	}

	if _, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(raw),
		ContentType: aws.String(contentType),
	}); err != nil {
		return nil, fmt.Errorf("falha no upload: %w", err)
	}

	return &UploadImageOutput{
		Key:          key,
		URL:          s.BuildPublicURL(key),
		OriginalName: strings.TrimSpace(input.OriginalName),
		FileName:     path.Base(key),
		ContentType:  contentType,
		Size:         int64(len(raw)),
	}, nil
}

func (s *OracleObjectStorageService) DeleteImage(ctx context.Context, key string) error {
	cleanKey := strings.TrimSpace(key)
	if cleanKey == "" {
		return nil
	}
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(cleanKey),
	})
	if err != nil {
		return fmt.Errorf("falha ao remover imagem: %w", err)
	}
	return nil
}

func (s *OracleObjectStorageService) BuildObjectKey(storeID string, contextName string, extension string) (string, error) {
	cleanStoreID := strings.TrimSpace(storeID)
	if !validStoreIDPattern.MatchString(cleanStoreID) {
		return "", fmt.Errorf("store_id invalido")
	}
	cleanContext, err := normalizeContext(contextName)
	if err != nil {
		return "", err
	}

	ext := strings.ToLower(strings.TrimSpace(extension))
	if !strings.HasPrefix(ext, ".") {
		ext = "." + ext
	}
	if !allowedImageExts[ext] {
		return "", fmt.Errorf("extensao de imagem nao suportada")
	}

	fileName := uuid.NewString() + ext
	return fmt.Sprintf("%s-store/%s/%s", cleanStoreID, cleanContext, fileName), nil
}

func (s *OracleObjectStorageService) BuildPublicURL(key string) string {
	cleanKey := strings.TrimSpace(key)
	if cleanKey == "" {
		return ""
	}
	if s.publicBaseURL != "" {
		return strings.TrimRight(s.publicBaseURL, "/") + "/" + escapeObjectKey(cleanKey)
	}
	if s.namespace != "" && s.region != "" {
		return fmt.Sprintf(
			"https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
			s.region,
			url.PathEscape(s.namespace),
			url.PathEscape(s.bucket),
			escapeObjectKey(cleanKey),
		)
	}
	return strings.TrimRight(s.s3Endpoint, "/") + "/" + url.PathEscape(s.bucket) + "/" + escapeObjectKey(cleanKey)
}

func normalizeContext(contextName string) (string, error) {
	clean := strings.ToLower(strings.TrimSpace(contextName))
	if clean == "" {
		return "", fmt.Errorf("contexto obrigatorio")
	}
	if !allowedContexts[clean] {
		return "", fmt.Errorf("contexto invalido")
	}
	return clean, nil
}

func escapeObjectKey(key string) string {
	parts := strings.Split(key, "/")
	for i, p := range parts {
		parts[i] = url.PathEscape(p)
	}
	return strings.Join(parts, "/")
}
