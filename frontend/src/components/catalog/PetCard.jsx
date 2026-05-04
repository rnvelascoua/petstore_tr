import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from '../common/ImageWithFallback';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export default function PetCard({ pet }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/pets/${pet.id}`)}>
        <ImageWithFallback src={pet.imageUrl} alt={pet.name} />
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">{pet.name}</Typography>
            <Chip
              label={pet.available ? 'Available' : 'Unavailable'}
              color={pet.available ? 'success' : 'error'}
              size="small"
            />
          </Stack>
          <Typography color="text.secondary">{pet.breed}</Typography>
          <Typography sx={{ fontWeight: 700, mt: 1 }}>{formatPrice(pet.price)}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
