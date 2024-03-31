package model

import (
	"time"
)

type CollectionBottle struct {
	ID           uint64 `gorm:"primaryKey" json:"id"`
	CollectionID uint64 `json:"collection_id"`
	BottleID     uint64 `json:"bottle_id"`

	CreatedAt time.Time `json:"created_at"`

	Collection Collection
	Bottle     Bottle
}

func (CollectionBottle) TableName() string {
	return "collection_bottle"
}

type CollectionBottles []*CollectionBottle
