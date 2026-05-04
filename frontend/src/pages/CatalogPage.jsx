import { Alert, Box, Container, Pagination, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPets } from '../api/petsApi';
import CategoryFilter from '../components/catalog/CategoryFilter';
import PetCatalog from '../components/catalog/PetCatalog';
import SearchBar from '../components/catalog/SearchBar';

function categoryLabel(category) {
  if (!category) {
    return 'pets';
  }
  const labels = {
    CATS: 'Cats',
    DOGS: 'Dogs',
    FISH: 'Fish',
    BIRDS: 'Birds',
  };
  return labels[category] || category;
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const activeCategory = searchParams.get('category') || '';
  const activePage = Number(searchParams.get('page') || '0');

  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState((searchParams.get('search') || '').trim());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      next.set('search', debouncedSearch);
    } else {
      next.delete('search');
    }

    if (activeCategory) {
      next.set('category', activeCategory);
    } else {
      next.delete('category');
    }

    next.set('page', String(activePage));
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategory, activePage, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getPets({
      search: debouncedSearch,
      category: activeCategory,
      page: activePage,
      size: 20,
      signal: controller.signal,
    })
      .then((data) => {
        setPets(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError' && requestError.name !== 'AbortError') {
          setError('Unable to load pets. Please try again.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedSearch, activeCategory, activePage]);

  const emptyMessage = useMemo(() => {
    if (debouncedSearch && activeCategory) {
      return `No ${categoryLabel(activeCategory)} found for '${debouncedSearch}'`;
    }
    if (debouncedSearch) {
      return `No pets found for '${debouncedSearch}'`;
    }
    if (activeCategory) {
      return 'No pets available in this category';
    }
    return 'No pets available right now. Please check back later.';
  }, [activeCategory, debouncedSearch]);

  function updateCategory(category) {
    const next = new URLSearchParams(searchParams);
    if (category) {
      next.set('category', category);
    } else {
      next.delete('category');
    }
    next.set('page', '0');
    setSearchParams(next);
  }

  function clearSearch() {
    setInputValue('');
    setDebouncedSearch('');
  }

  function changePage(_, uiPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(uiPage - 1));
    setSearchParams(next);
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h3" component="h1">
          Browse Pets
        </Typography>

        {error ? (
          <Alert severity="error" action={<span onClick={() => window.location.reload()} role="button" tabIndex={0}>Retry</span>}>
            {error}
          </Alert>
        ) : null}

        <SearchBar value={inputValue} onChange={setInputValue} onClear={clearSearch} />
        <CategoryFilter value={activeCategory} onChange={updateCategory} />

        <PetCatalog
          pets={pets}
          loading={loading}
          emptyMessage={emptyMessage}
          onClear={debouncedSearch ? clearSearch : undefined}
        />

        {totalPages > 1 ? (
          <Box display="flex" justifyContent="center">
            <Pagination
              page={activePage + 1}
              count={totalPages}
              onChange={changePage}
              color="primary"
            />
          </Box>
        ) : null}
      </Stack>
    </Container>
  );
}
