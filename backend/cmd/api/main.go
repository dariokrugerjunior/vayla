package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"multi-tennet/internal/config"
	"multi-tennet/internal/database"
	apphttp "multi-tennet/internal/http"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	ctx := context.Background()

	db, err := database.NewPostgres(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("postgres error: %v", err)
	}
	defer db.Close()

	rdb, err := database.NewRedis(ctx, cfg.Redis)
	if err != nil {
		log.Fatalf("redis error: %v", err)
	}
	defer rdb.Close()

	router := apphttp.NewServer(cfg, db, rdb)

	server := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.App.Port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("%s running on :%d", cfg.App.Name, cfg.App.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown error: %v", err)
	}
}

