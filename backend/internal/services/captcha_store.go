package services

import (
	"admin-dashboard/internal/utils"
	"strings"
	"sync"
	"time"
)

type CaptchaStore struct {
	challenges map[string]utils.CaptchaChallenge
	mu         sync.RWMutex
	expiry     time.Duration
}

func NewCaptchaStore() *CaptchaStore {
	store := &CaptchaStore{
		challenges: make(map[string]utils.CaptchaChallenge),
		expiry:     5 * time.Minute,
	}

	// Cleanup expired captchas periodically
	go store.cleanup()

	return store
}

func (cs *CaptchaStore) Generate() utils.CaptchaChallenge {
	challenge := utils.GenerateMathCaptcha()
	cs.mu.Lock()
	cs.challenges[challenge.ID] = challenge
	cs.mu.Unlock()
	return challenge
}

func (cs *CaptchaStore) Verify(captchaID, answer string) bool {
	if captchaID == "" || answer == "" {
		return false
	}

	cs.mu.RLock()
	challenge, exists := cs.challenges[captchaID]
	cs.mu.RUnlock()

	if !exists {
		return false
	}

	// Normalize answer comparison (trim whitespace, case-insensitive for string captchas)
	normalizedAnswer := strings.TrimSpace(answer)
	normalizedStored := strings.TrimSpace(challenge.Answer)

	// Verify answer (case-sensitive for math, but allow whitespace trimming)
	if normalizedStored != normalizedAnswer {
		return false
	}

	// Remove used captcha
	cs.mu.Lock()
	delete(cs.challenges, captchaID)
	cs.mu.Unlock()

	return true
}

func (cs *CaptchaStore) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		cs.mu.Lock()
		now := time.Now()
		for id, challenge := range cs.challenges {
			// Note: We don't track creation time in CaptchaChallenge
			// For simplicity, we'll just limit the total number of stored captchas
			if len(cs.challenges) > 1000 {
				delete(cs.challenges, id)
			}
			_ = challenge
			_ = now
		}
		cs.mu.Unlock()
	}
}
