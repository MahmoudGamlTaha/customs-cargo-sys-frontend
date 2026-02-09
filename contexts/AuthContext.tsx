import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getCurrentUser } from '../services/authService';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER = 'user';

interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER);
      setUser(null); // Also clear user when token is removed
    }
  }, []);

  useEffect(() => {
    // debugger;
    const fetchUser = () => {
      if (token) {
        setLoading(true);
        try {
          // debugger;
          const response = getCurrentUser();
          if (response) {
            // debugger;
            setUser(response);
            // The token in the response might be refreshed, but we'll trust the one we have
            // unless the auth service indicates otherwise. For now, we assume the token is valid.
          } else {
            setToken(null); // Token is invalid or expired
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setToken(null); // Clear token on error
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY) {
        setTokenState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
