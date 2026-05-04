import { Box, Button, Typography } from '@mui/material';

export default function EmptyState({ message, onClear }) {
  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6" gutterBottom>
        {message}
      </Typography>
      {onClear ? (
        <Button variant="outlined" onClick={onClear}>
          Clear search
        </Button>
      ) : null}
    </Box>
  );
}
