package internal

import (
	"eshkere/pkg/httpx"
	"net/http"

	"github.com/gorilla/mux"
)

const AdsGroupURI = "/ads"

func (a *API) RegisterAdsHandlers(r *mux.Router) {
	adsGroup := r.PathPrefix(AdsGroupURI).Subrouter()

	adsGroup.Use(Auth(a.sessionManager))
	adsGroup.HandleFunc("", a.ListAds).Methods(http.MethodGet)
	// adsGroup.HandleFunc("/", a.ListAds).Methods(http.MethodGet)
}

func (a *API) ListAds(w http.ResponseWriter, r *http.Request) {
	advertiserID, err := AdvertiserIDFromContext(r.Context())
	if err != nil {
		httpx.Unauthorized(w, "unauthorized")
		return
	}

	// Достаем кампании именно для этого рекламодателя
	ads, ok := mockAds[advertiserID]
	if !ok {
		ads = []AdResponse{} // отдаем пустой список, если кампаний нет
	}

	resp := ListAdsResponse{
		AdvertiserID: advertiserID,
		Ads:          ads,
	}

	httpx.JSON(w, http.StatusOK, resp)
}
