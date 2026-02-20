package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatMessage struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SenderID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"sender_id"`
	ReceiverID *uuid.UUID `gorm:"type:uuid;index" json:"receiver_id,omitempty"` // nullable for group chat
	Message    string     `gorm:"not null;type:text" json:"message"`
	CreatedAt  time.Time  `gorm:"index" json:"created_at"`
	Sender     User       `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver   *User      `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
}

func (cm *ChatMessage) BeforeCreate(tx *gorm.DB) error {
	if cm.ID == uuid.Nil {
		cm.ID = uuid.New()
	}
	return nil
}
