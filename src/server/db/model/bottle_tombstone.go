package model

type BottleTombstone struct {
	BottleID    uint64 `gorm:"primaryKey;autoIncrement:false" json:"bottle_id"`
	NewBottleID uint64 `gorm:"primaryKey;autoIncrement:false" json:"new_bottle_id"`

	Bottle    Bottle
	NewBottle Bottle
}

func (BottleTombstone) TableName() string {
	return "bottle_tombstone"
}

type BottleTombstones []*BottleTombstone