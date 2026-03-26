import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient, extractErrorMessage } from '../api/client';

const TOKEN_KEY = 'food_auth_token';
const USER_KEY = 'food_auth_user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const persistAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/auth/me');
      persistAuth(localStorage.getItem(TOKEN_KEY), data.data);
    } catch {
      persistAuth(null, null);
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const registerCustomer = useCallback(
    async (payload) => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.post('/auth/register-customer', payload);
        persistAuth(data.data.token, data.data.user);
        return { success: true, data: data.data };
      } catch (error) {
        return { success: false, message: extractErrorMessage(error) };
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const registerPartner = useCallback(
    async (payload) => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.post('/auth/register', payload);
        persistAuth(data.data.token, data.data.user);
        return { success: true, data: data.data };
      } catch (error) {
        return { success: false, message: extractErrorMessage(error) };
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const register = registerCustomer;

  const login = useCallback(
    async (payload) => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.post('/auth/login', payload);
        persistAuth(data.data.token, data.data.user);
        return { success: true, data: data.data };
      } catch (error) {
        return { success: false, message: extractErrorMessage(error) };
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    persistAuth(null, null);
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      registerCustomer,
      registerPartner,
      logout,
      refreshProfile,
    }),
    [
      isLoading,
      login,
      logout,
      refreshProfile,
      register,
      registerCustomer,
      registerPartner,
      token,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

