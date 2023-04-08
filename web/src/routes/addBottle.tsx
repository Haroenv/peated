import { AddBox as AddIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import BrandSelect from "../components/brandSelect";
import DistillerSelect from "../components/distillerSelect";
import { Brand, Category, Distiller } from "../types";
import { FormEvent, useState } from "react";

function toTitleCase(value: string) {
  var words = value.toLowerCase().split(" ");
  for (var i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1);
  }
  return words.join(" ");
}

type FormData = {
  name?: string;
  series?: string;
  brand?: Brand;
  distiller?: Distiller;
  abv?: number;
  age?: number;
  category?: Category;
};

export default function AddBottle() {
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>({});

  const qs = new URLSearchParams(location.search);
  const name = qs.get("name") || "";

  const categoryList = [
    "blend",
    "blended_grain",
    "blended_malt",
    "blended_scotch",
    "bourbon",
    "rye",
    "single_grain",
    "single_malt",
    "spirit",
  ].map((c) => ({
    id: c,
    name: toTitleCase(c.replace("_", " ")),
  }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h4" gutterBottom>
        Add Bottle
      </Typography>

      <Box component="form" noValidate sx={{ mt: 3 }} onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <BrandSelect
              onChange={(value) => setFormData({ ...formData, brand: value })}
            />
          </Grid>
          <Grid item xs={12}>
            <DistillerSelect
              onChange={(value) =>
                setFormData({ ...formData, distiller: value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bottle"
              name="name"
              placeholder="e.g. Macallan 12"
              variant="outlined"
              defaultValue={name}
              required
              helperText="The full name of the bottle, excluding its series."
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Series"
              name="series"
              placeholder="e.g. The Edition"
              variant="outlined"
              helperText="If applicable, the series of bottling."
              onChange={(e) =>
                setFormData({ ...formData, series: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ABV"
              required
              placeholder="e.g. 45"
              name="abv"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              variant="outlined"
              helperText="The alcohol content by volume."
              onChange={(e) =>
                setFormData({ ...formData, abv: parseInt(e.target.value, 10) })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Age"
              placeholder="e.g. 12"
              name="age"
              type="number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">years</InputAdornment>
                ),
              }}
              variant="outlined"
              helperText="If applicable, the number of years the spirit was aged."
              onChange={(e) =>
                setFormData({ ...formData, age: parseInt(e.target.value, 10) })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                fullWidth
                label="Category"
                name="category"
                variant="outlined"
                labelId="category-label"
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {categoryList.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>The kind of spirit.</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              endIcon={<AddIcon />}
              size="large"
              type="submit"
            >
              Save Bottle
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
