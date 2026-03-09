package internal

import (
	"context"
	"database/sql"
	"eshkere/internal/session"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
)

type App struct {
	cfg            *Config
	db             *sql.DB
	sessionManager *session.Manager
	// TODO: closers []io.Closer
	// TODO: starters []StartAsService
}

func New(configPath string) *App {
	cfg, err := ReadConfig(configPath)
	if err != nil {
		log.Fatalf("Failed to read config: %v", err)
	}

	//db, err := initDB(cfg.Postgres)
	//if err != nil {
	//	log.Fatalf("Failed to init DB: %v", err)
	//}

	sessionManager := session.NewManager()
	sessionManager.StartCleanup(5 * time.Minute)

	return &App{
		cfg: cfg,
		//db:             db,
		sessionManager: sessionManager,
	}
}

func (a *App) Run() error {
	router := mux.NewRouter().StrictSlash(true)

	Register(router, NewAPI(APIConfig{
		// Service: svc,
		SessionManager: a.sessionManager,
	}))

	server := &http.Server{
		Addr:         a.cfg.HTTPServer.Listen,
		Handler:      CORS(a.cfg.CORS.AllowedOrigins)(router),
		ReadTimeout:  a.cfg.HTTPServer.ReadTimeout,
		WriteTimeout: a.cfg.HTTPServer.WriteTimeout,
	}

	serverErr := make(chan error, 1)

	go func() {
		log.Printf("server started on %s", server.Addr)
		serverErr <- server.ListenAndServe()
	}()

	return a.waitShutdown(server, serverErr)
}

func (a *App) waitShutdown(server *http.Server, serverErr <-chan error) error {
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(stop)

	select {
	case err := <-serverErr:
		if err != nil && err != http.ErrServerClosed {
			return fmt.Errorf("http server failed: %w", err)
		}
		return nil

	case <-stop:
		return a.shutdown(server)
	}
}

func (a *App) shutdown(server *http.Server) error {
	ctx, cancel := context.WithTimeout(context.Background(), a.cfg.GracefulTimeout)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		return fmt.Errorf("shutdown server: %w", err)
	}

	if err := a.db.Close(); err != nil {
		return fmt.Errorf("close db: %w", err)
	}

	return nil
}
