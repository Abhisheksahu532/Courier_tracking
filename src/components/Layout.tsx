import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Package, User, LogOut } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Package className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  CourierTrack
                </span>
              </Link>
            </div>

            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/${user.role.toLowerCase()}`}
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-700 hover:text-indigo-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-1">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2024 CourierTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;