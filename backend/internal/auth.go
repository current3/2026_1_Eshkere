package internal

import (
	"context"
	"eshkere/internal/session"
	"eshkere/pkg/httpx"
	"net/http"
)

func Auth(sm *session.Manager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			sess, err := sm.Get(w, r)
			if err != nil {
				httpx.Unauthorized(w, "unauthorized")
				return
			}

			ctx := context.WithValue(r.Context(), AdvertiserIDKey, sess.AdvertiserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
