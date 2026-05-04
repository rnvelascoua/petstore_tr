import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPetById } from '../api/petsApi';
import ImageWithFallback from '../components/common/ImageWithFallback';
import LoadingSpinner from '../components/common/LoadingSpinner';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function formatAge(ageInMonths) {
  if (ageInMonths >= 12) {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return `${years} years ${months} months`;
  }
  return `${ageInMonths} months`;
}

export default function PetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);

    getPetById(id, controller.signal)
      .then((data) => setPet(data))
      .catch((error) => {
        if (error?.response?.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound || !pet) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>
          Pet not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />}>
          Back to catalog
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Button variant="text" onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
          Back
        </Button>

        <ImageWithFallback src={pet.imageUrl} alt={pet.name} height={320} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{pet.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {pet.breed}
            </Typography>
          </Box>
          <Chip
            label={pet.available ? 'Available' : 'Unavailable'}
            color={pet.available ? 'success' : 'error'}
          />
        </Stack>

        <Typography>
          <strong>Age:</strong> {formatAge(pet.age)}
        </Typography>
        <Typography>
          <strong>Price:</strong> {formatPrice(pet.price)}
        </Typography>
        <Typography>{pet.description}</Typography>
      </Stack>
    </Container>
  );
}
