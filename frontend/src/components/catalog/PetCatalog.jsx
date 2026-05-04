import { Grid } from '@mui/material';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from './EmptyState';
import PetCard from './PetCard';

export default function PetCatalog({ pets, loading, emptyMessage, onClear }) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!pets.length) {
    return <EmptyState message={emptyMessage} onClear={onClear} />;
  }

  return (
    <Grid container spacing={2}>
      {pets.map((pet) => (
        <Grid key={pet.id} item xs={12} sm={6} md={4} lg={3}>
          <PetCard pet={pet} />
        </Grid>
      ))}
    </Grid>
  );
}
