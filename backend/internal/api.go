package internal

import (
	"eshkere/internal/session"
	"sync"

	"github.com/gorilla/mux"
)

type Service interface {
	SaveLoginData()
	// методы из сервисного слоя
}

type APIConfig struct {
	Service        Service
	SessionManager *session.Manager
}

type API struct {
	service        Service
	sessionManager *session.Manager
}

func NewAPI(config APIConfig) *API {
	return &API{
		service:        config.Service,
		sessionManager: config.SessionManager,
	}
}

func (a *API) RegisterRoutes(r *mux.Router) {
	a.RegisterAdvertiserHandlers(r)
	a.RegisterAdsHandlers(r)
	// другие хендлеры
}

type User struct {
	ID       int
	Email    string
	Phone    string
	Password string
}

var (
	usersByEmail = make(map[string]*User)
	usersByPhone = make(map[string]*User)
	userMu       sync.RWMutex
	lastID       = 0
)

func init() {
	// Твой захардкоженный аккаунт
	lastID++
	u := &User{
		ID:       lastID,
		Email:    "test@mail.com",
		Phone:    "+79991234567",
		Password: "123123",
	}
	usersByEmail[u.Email] = u
	usersByPhone[u.Phone] = u
}

var (
	// Мапа: AdvertiserID -> Список его кампаний
	mockAds = map[int][]AdResponse{
		1: {
			{ID: 1, Title: "iPhone 14", Description: "В отличном состоянии", Price: 70000},
			{ID: 2, Title: "MacBook Air M1", Description: "Для работы", Price: 85000},
		},
		2: {
			{ID: 3, Title: "PlayStation 5", Description: "Почти новая", Price: 50000},
		},
	}
)
