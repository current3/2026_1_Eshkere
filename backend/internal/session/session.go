package session

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"sync"
	"time"
)

const (
	CookieName = "session_id"
	SessionTTL = 24 * time.Hour
)

var ErrSessionNotFound = errors.New("session not found")

type Session struct {
	AdvertiserID int
	ExpiresAt    time.Time
}

// пока бд нет в мапке храним
type Manager struct {
	mu       sync.RWMutex
	sessions map[string]Session
}

func NewManager() *Manager {
	return &Manager{
		sessions: make(map[string]Session),
	}
}

func (m *Manager) Create(w http.ResponseWriter, r *http.Request, advertiserID int) error {
	if cookie, err := r.Cookie(CookieName); err == nil {
		m.mu.Lock()
		delete(m.sessions, cookie.Value)
		m.mu.Unlock()
	}

	sessionID, err := generateSessionID()
	if err != nil {
		return err
	}

	expiresAt := time.Now().Add(SessionTTL)

	m.mu.Lock()
	m.sessions[sessionID] = Session{
		AdvertiserID: advertiserID,
		ExpiresAt:    expiresAt,
	}
	m.mu.Unlock()

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    sessionID,
		Expires:  expiresAt,
		MaxAge:   int(SessionTTL.Seconds()),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		// Secure:   true,
	})

	return nil
}

func (m *Manager) Get(w http.ResponseWriter, r *http.Request) (Session, error) {
	cookie, err := r.Cookie(CookieName)
	if err != nil {
		return Session{}, ErrSessionNotFound
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	session, ok := m.sessions[cookie.Value]
	if !ok {
		return Session{}, ErrSessionNotFound
	}

	if time.Now().After(session.ExpiresAt) {
		delete(m.sessions, cookie.Value)
		return Session{}, ErrSessionNotFound
	}

	//продлеваем, если пользак ватафа_к активен
	newExpiresAt := time.Now().Add(SessionTTL)
	session.ExpiresAt = newExpiresAt
	m.sessions[cookie.Value] = session

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    cookie.Value,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Expires:  newExpiresAt,
		MaxAge:   int(SessionTTL.Seconds()),
	})

	return session, nil
}

func (m *Manager) Destroy(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(CookieName)
	if err == nil {
		m.mu.Lock()
		delete(m.sessions, cookie.Value)
		m.mu.Unlock()
	}

	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		SameSite: http.SameSiteLaxMode,
		// Secure:   true,
	})
}

// пока что просто рандомим)
func generateSessionID() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
