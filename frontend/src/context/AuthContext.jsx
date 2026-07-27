import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('touris_token');
    const mcp = localStorage.getItem('touris_must_change_password');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role });
        setMustChangePassword(mcp === 'true');
      } else {
        // Token expired
        localStorage.removeItem('touris_token');
        localStorage.removeItem('touris_must_change_password');
      }
    }
    setIsInitializing(false);
  }, []);

  const login = (token, role, name, must_change_password) => {
    localStorage.setItem('touris_token', token);
    localStorage.setItem('touris_must_change_password', must_change_password ? 'true' : 'false');
    const decoded = parseJwt(token);
    setUser({ id: decoded?.id, email: decoded?.email, name, role });
    setMustChangePassword(!!must_change_password);
  };

  const logout = () => {
    localStorage.removeItem('touris_token');
    localStorage.removeItem('touris_must_change_password');
    setUser(null);
    setMustChangePassword(false);
  };

  const passwordChanged = () => {
    localStorage.setItem('touris_must_change_password', 'false');
    setMustChangePassword(false);
  };

  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, mustChangePassword, isInitializing, login, logout, passwordChanged, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
