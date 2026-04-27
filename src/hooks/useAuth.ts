import { useAuthStore } from '../store/authStore';

/**
 * Hook that provides access to authentication state and actions.
 * Components should use this hook instead of importing the store directly.
 */
export function useAuth() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const autoLogin = useAuthStore((state) => state.autoLogin);

  return {
    currentUser,
    isAdmin,
    login,
    logout,
    autoLogin,
  };
}
