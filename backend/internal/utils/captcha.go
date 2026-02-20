package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"math/big"
	"strconv"
)

type CaptchaChallenge struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"-"` // Not sent to client (can be int as string or string code)
}

func GenerateMathCaptcha() CaptchaChallenge {
	// Generate random numbers for simple math problem
	num1, _ := rand.Int(rand.Reader, big.NewInt(20))
	num2, _ := rand.Int(rand.Reader, big.NewInt(20))
	
	a := int(num1.Int64()) + 1
	b := int(num2.Int64()) + 1
	answer := a + b

	// Generate a unique ID for this captcha
	idBytes := make([]byte, 16)
	rand.Read(idBytes)
	id := base64.URLEncoding.EncodeToString(idBytes)

	return CaptchaChallenge{
		ID:       id,
		Question: fmt.Sprintf("What is %d + %d?", a, b),
		Answer:   strconv.Itoa(answer),
	}
}

func GenerateStringCaptcha() CaptchaChallenge {
	// Generate random 5-character string
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	length := 5
	bytes := make([]byte, length)
	for i := range bytes {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		bytes[i] = chars[num.Int64()]
	}
	captchaStr := string(bytes)

	// Generate a unique ID
	idBytes := make([]byte, 16)
	rand.Read(idBytes)
	id := base64.URLEncoding.EncodeToString(idBytes)

	return CaptchaChallenge{
		ID:       id,
		Question: "Enter the following code: " + captchaStr,
		Answer:   captchaStr,
	}
}
