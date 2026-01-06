import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importamos tus páginas
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage'; // <--- 1. AGREGADO AQUÍ

// Componente para proteger la ruta (si no hay usuario, te manda al landing)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Ruta Pública: Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Ruta Privada: Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Ruta Privada: Resultados */}
            {/* <--- 2. AGREGADO AQUÍ: Conectamos tu página de resultados */}
            <Route path="/results" element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } />

          </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;