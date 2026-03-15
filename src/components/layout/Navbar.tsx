import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import { Button } from '../ui/Button';

export function Navbar() {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link to={isAuthenticated() ? '/dashboard' : '/'} className="font-semibold text-navy text-lg">
          OptimalPay
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-navy">Dashboard</Link>
              <Link to="/wallet" className="text-sm text-gray-600 hover:text-navy">Wallet</Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-navy">Log in</Link>
              <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
