import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

export async function getPets({ search, category, page = 0, size = 20, signal } = {}) {
  const params = { page, size };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  if (category) {
    params.category = category;
  }

  const { data } = await api.get('/api/v1/pets', { params, signal });
  return data;
}

export async function getPetById(id, signal) {
  const { data } = await api.get(`/api/v1/pets/${id}`, { signal });
  return data;
}
