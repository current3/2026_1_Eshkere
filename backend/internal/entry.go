package internal

import "github.com/gorilla/mux"

type HTTPController interface {
	RegisterRoutes(router *mux.Router)
}

func Register(r *mux.Router, controllers ...HTTPController) {
	for _, controller := range controllers {
		controller.RegisterRoutes(r)
	}
}
