package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RolePermission struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RoleID       uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_role_permission" json:"role_id"`
	PermissionID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_role_permission" json:"permission_id"`
	Role         Role      `gorm:"foreignKey:RoleID" json:"-"`
	Permission   Permission `gorm:"foreignKey:PermissionID" json:"-"`
}

func (rp *RolePermission) BeforeCreate(tx *gorm.DB) error {
	if rp.ID == uuid.Nil {
		rp.ID = uuid.New()
	}
	return nil
}
