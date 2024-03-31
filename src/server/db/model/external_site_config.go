package model

import (
	"peated/db/column"
	"time"
)

type ExternalSiteConfig struct {
	ExternalSiteID uint64       `gorm:"primaryKey;autoincrement:false" json:"external_site_id"`
	Key            string       `gorm:"primaryKey" json:"key"`
	Value          column.JSONB `json:"data"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (ExternalSiteConfig) TableName() string {
	return "external_site_config"
}

type ExternalSiteConfigs []*ExternalSiteConfig
