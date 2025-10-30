import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  apiKey: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Генерируем короткий API ключ для пользователя
  const generateApiKey = (userId: string): string => {
    // Создаем короткий ключ: WDX + 8 символов
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'WDX_';
    
    // Добавляем 8 случайных символов
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  };

  useEffect(() => {
    // Проверяем сохраненную сессию и валидируем с сервером
    const saved = localStorage.getItem('windexs_user');
    if (saved) {
      const { apiKey } = JSON.parse(saved);
      fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('windexs_user', JSON.stringify(data.user));
          } else {
            localStorage.removeItem('windexs_user');
            setUser(null);
          }
          setInitializing(false);
        })
        .catch(() => {
          localStorage.removeItem('windexs_user');
          setUser(null);
          setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('windexs_user', JSON.stringify(data.user));
        return true;
      }
    } catch (error) {
      console.error('Auth login error:', error);
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('windexs_user', JSON.stringify(data.user));
        return true;
      }
    } catch (error) {
      console.error('Auth register error:', error);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('windexs_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
    , initializing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
