package entity_test

import (
	"context"
	"peated/api/resource/entity"
	"peated/database/column/spatial"
	"peated/database/model"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEntityResponse_Location(t *testing.T) {
	ctx := context.Background()

	location, err := spatial.NewPoint("-122.4194", "37.7749")
	require.NoError(t, err)

	entity1 := &model.Entity{
		Location: location,
	}

	response := entity.NewEntityResponse(ctx, entity1)
	assert.Equal(t, -122.4194, response.Entity.Location.Lng)
	assert.Equal(t, 37.7749, response.Entity.Location.Lat)
}

func TestNewEntityResponse_LocationEmpty(t *testing.T) {
	ctx := context.Background()

	entity1 := &model.Entity{
		Location: nil,
	}

	response := entity.NewEntityResponse(ctx, entity1)
	assert.Equal(t, strconv.FormatUint(entity1.ID, 10), response.Entity.ID)
	assert.Nil(t, response.Entity.Location)
}
