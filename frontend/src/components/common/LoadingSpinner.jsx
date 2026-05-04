import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner() {
  return (
    <Box display="flex" justifyContent="center" py={6}>
      <CircularProgress aria-label="Loading" />
    </Box>
  );
}
