package handlers

import (
	"fmt"
	"log"
	"multi-tennet/internal/service"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *HandlerContainer) AdminUploadImage(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}
	if h.StorageSvc == nil {
		JSONError(c, 503, fmt.Errorf("storage not configured"))
		return
	}

	fileHeader, err := c.FormFile("file")
	if err != nil || fileHeader == nil {
		JSONError(c, 400, errMissing("file"))
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		JSONError(c, 400, errInvalid("file"))
		return
	}
	defer file.Close()

	contextName := strings.TrimSpace(c.PostForm("context"))
	if contextName == "" {
		contextName = strings.TrimSpace(c.Query("context"))
	}

	out, err := h.StorageSvc.UploadImage(c.Request.Context(), service.UploadImageInput{
		File:         file,
		OriginalName: fileHeader.Filename,
		StoreID:      strconv.FormatInt(storeID, 10),
		ContextName:  contextName,
		Size:         fileHeader.Size,
	})
	if err != nil {
		log.Printf("upload failure store=%d context=%s file=%s error=%v", storeID, contextName, fileHeader.Filename, err)
		JSONError(c, 400, err)
		return
	}

	log.Printf("upload success store=%d context=%s key=%s size=%d", storeID, contextName, out.Key, out.Size)
	JSONCreated(c, out)
}
