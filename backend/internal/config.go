package internal

import (
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type HTTPServerConfig struct {
	Listen       string        `yaml:"listen"`
	ReadTimeout  time.Duration `yaml:"read_timeout"`
	WriteTimeout time.Duration `yaml:"write_timeout"`
}

type PostgresConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Database string `yaml:"database"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

type CORSConfig struct {
	AllowedOrigins []string `yaml:"allowed_origins"`
}

type Config struct {
	HTTPServer      HTTPServerConfig `yaml:"http_server"`
	Postgres        PostgresConfig   `yaml:"postgres"`
	CORS            CORSConfig       `yaml:"cors"`
	GracefulTimeout time.Duration    `yaml:"graceful_timeout"`
}

func ReadConfig(path string) (*Config, error) {
	cfg := &Config{}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	expanded := os.ExpandEnv(string(data))

	if err := yaml.Unmarshal([]byte(expanded), cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
