import { Box } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import { useState } from 'react';

export default function ImageWithFallback({ src, alt, height = 180 }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#eceff1',
        }}
      >
        <PetsIcon sx={{ fontSize: 48 }} aria-label="Image placeholder" />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      sx={{ width: '100%', height, objectFit: 'cover' }}
    />
  );
}
