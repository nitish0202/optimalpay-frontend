import { useAuthStore } from '../store/authStore';
import { logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const store = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      store.clearAuth();
      navigate('/login');
    }
  };

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated(),
    logout: handleLogout,
  };
}
