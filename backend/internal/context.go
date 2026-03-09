package internal

import (
	"context"
	"errors"
)

const AdvertiserIDKey string = "advertiser_id"

var ErrAdvertiserIDNotFound = errors.New("advertiser id not found in context")

func AdvertiserIDFromContext(ctx context.Context) (int, error) {
	value := ctx.Value(AdvertiserIDKey)
	if value == nil {
		return 0, ErrAdvertiserIDNotFound
	}

	id, ok := value.(int)
	if !ok {
		return 0, ErrAdvertiserIDNotFound
	}

	return id, nil
}
