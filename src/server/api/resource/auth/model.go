package auth

import (
	"context"
	"peated/api/resource/user"
	"peated/db/model"
)

type EmailPasswordInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CodeInput struct {
	Code string `json:"code"`
}

type AuthDTO struct {
	User        *user.UserDTO `json:"user"`
	AccessToken string        `json:"accessToken"`
}

type GoogleClaims struct {
	Email     string `json:"email"`
	GivenName string `json:"given_name"`
	Sub       string `json:"sub"`
}

func DTOFromUser(ctx context.Context, u *model.User, t string) *AuthDTO {
	return &AuthDTO{
		User:        user.DTOFromUser(ctx, u),
		AccessToken: t,
	}

}