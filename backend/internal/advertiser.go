package internal

import (
	"eshkere/pkg/httpx"
	"net/http"

	"github.com/gorilla/mux"
)

const AdvertiserGroupURI = "/advertiser"

const (
	RegisterURI = "/register"
	LoginURI    = "/login"
	LogoutURI   = "/logout"
)

func (a *API) RegisterAdvertiserHandlers(r *mux.Router) {
	advertiserGroup := r.PathPrefix(AdvertiserGroupURI).Subrouter()

	advertiserGroup.HandleFunc(RegisterURI, a.Register).Methods(http.MethodPost)
	advertiserGroup.HandleFunc(LoginURI, a.Login).Methods(http.MethodPost)
	advertiserGroup.HandleFunc(LogoutURI, a.Logout).Methods(http.MethodPost)
}

func (a *API) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.BadRequest(w, "invalid request")
		return
	}

	userMu.Lock()
	if _, exists := usersByEmail[req.Email]; exists {
		userMu.Unlock()
		httpx.BadRequest(w, "user already exists")
		return
	}

	lastID++
	newUser := &User{
		ID:       lastID,
		Email:    req.Email,
		Phone:    req.Phone,
		Password: req.Password,
	}
	usersByEmail[newUser.Email] = newUser
	usersByPhone[newUser.Phone] = newUser
	userMu.Unlock()

	if err := a.sessionManager.Create(w, r, newUser.ID); err != nil {
		httpx.InternalError(w)
		return
	}

	httpx.JSON(w, http.StatusOK, RegisterResponse{
		ID:    newUser.ID,
		Email: newUser.Email,
		Phone: newUser.Phone,
	})
}

func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		httpx.BadRequest(w, "invalid request")
		return
	}

	userMu.RLock()
	// Ищем пользователя по любому из признаков
	user, exists := usersByEmail[req.Identifier]
	if !exists {
		user, exists = usersByPhone[req.Identifier]
	}
	userMu.RUnlock()

	if !exists || user.Password != req.Password {
		httpx.BadRequest(w, "invalid identifier or password")
		return
	}

	if err := a.sessionManager.Create(w, r, user.ID); err != nil {
		httpx.InternalError(w)
		return
	}

	httpx.JSON(w, http.StatusOK, LoginResponse{
		ID:    user.ID,
		Email: user.Email,
		Phone: user.Phone,
	})
}

func (a *API) Logout(w http.ResponseWriter, r *http.Request) {
	a.sessionManager.Destroy(w, r)

	httpx.JSON(w, http.StatusOK, map[string]string{
		"message": "logout ok",
	})
}
