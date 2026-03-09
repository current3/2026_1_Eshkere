package internal

import (
	"database/sql"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func initDB(cfg PostgresConfig) (*sql.DB, error) {
	dataSource := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable target_session_attrs=read-write statement_cache_mode=describe",
		cfg.Host,
		cfg.Username,
		cfg.Password,
		cfg.Database,
		cfg.Port,
	)

	db, err := sql.Open("pgx", dataSource)
	if err != nil {
		return nil, fmt.Errorf("create pool of connections to database: %w", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("connect to database: %w", err)
	}

	return db, nil
}
