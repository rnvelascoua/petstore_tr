import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, InputAdornment, TextField } from '@mui/material';

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <TextField
      fullWidth
      label="Search pets"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ maxLength: 100, 'aria-label': 'Search pets' }}
      InputProps={{
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton aria-label="Clear search" onClick={onClear} edge="end">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
