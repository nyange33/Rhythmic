package memory

import (
	"crypto/rand"
	"encoding/hex"
)

func newID() string {
	return randomHex(12)
}

func randomHex(n int) string {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}
