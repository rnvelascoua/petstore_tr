import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const options = [
  { label: 'All', value: '' },
  { label: 'Cats', value: 'CATS' },
  { label: 'Dogs', value: 'DOGS' },
  { label: 'Fish', value: 'FISH' },
  { label: 'Birds', value: 'BIRDS' },
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      color="primary"
      exclusive
      value={value}
      onChange={(_, nextValue) => {
        if (nextValue !== null) {
          onChange(nextValue);
        }
      }}
      aria-label="Pet category filter"
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value || 'ALL'} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
