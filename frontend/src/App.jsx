import { Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import PetDetailPage from './pages/PetDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/pets/:id" element={<PetDetailPage />} />
    </Routes>
  );
}
