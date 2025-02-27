import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import TrackingPage from './pages/TrackingPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OfficeManagerDashboard from './pages/OfficeManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuthStore } from './store/auth';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Redirect to login if not authenticated */}
          <Route path="/" element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }>
            <Route index element={<TrackingPage />} />
            
            {/* Protected Routes */}
            <Route path="customer" element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </PrivateRoute>
            } />
            
            <Route path="office" element={
              <PrivateRoute allowedRoles={['OFFICE_MANAGER']}>
                <OfficeManagerDashboard />
              </PrivateRoute>
            } />
            
            <Route path="admin" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Route>

          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage />
            )
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;