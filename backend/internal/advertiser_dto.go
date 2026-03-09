package internal

type RegisterRequest struct {
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type RegisterResponse struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type LoginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

type LoginResponse struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}
