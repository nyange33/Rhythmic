package storage

import "errors"

var (
	ErrNotFound      = errors.New("not found")
	ErrEmailTaken    = errors.New("email already taken")
	ErrUsernameTaken = errors.New("username already taken")
)
