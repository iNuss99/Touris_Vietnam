import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [realUser, setRealUser] = useState(null);
  const [viewAsRole, setViewAsRoleState] = useState(() => sessionStorage.getItem('touris_view_as_role') || null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const setViewAsRole = (role) => {
    if (!role || role === 'super_admin') {
      sessionStorage.removeItem('touris_view_as_role');
      setViewAsRoleState(null);
    } else {
      sessionStorage.setItem('touris_view_as_role', role);
      setViewAsRoleState(role);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('touris_token');
    const mcp = sessionStorage.getItem('touris_must_change_password');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setRealUser({ id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role });
        setMustChangePassword(mcp === 'true');
      } else {
        // Token expired
        sessionStorage.removeItem('touris_token');
        sessionStorage.removeItem('touris_must_change_password');
        sessionStorage.removeItem('touris_view_as_role');
      }
    }
    setIsInitializing(false);
  }, []);

  const login = (token, role, name, must_change_password) => {
    sessionStorage.setItem('touris_token', token);
    sessionStorage.setItem('touris_must_change_password', must_change_password ? 'true' : 'false');
    const decoded = parseJwt(token);
    setRealUser({ id: decoded?.id, email: decoded?.email, name, role });
    setMustChangePassword(!!must_change_password);
  };

  const logout = () => {
    sessionStorage.removeItem('touris_token');
    sessionStorage.removeItem('touris_must_change_password');
    sessionStorage.removeItem('touris_view_as_role');
    setRealUser(null);
    setViewAsRoleState(null);
    setMustChangePassword(false);
  };

  const passwordChanged = () => {
    sessionStorage.setItem('touris_must_change_password', 'false');
    setMustChangePassword(false);
  };

  const isSuperAdmin = realUser?.role === 'super_admin';

  const user = useMemo(() => {
    if (!realUser) return null;
    if (isSuperAdmin && viewAsRole) {
      return { ...realUser, role: viewAsRole, isSimulatedRole: true };
    }
    return realUser;
  }, [realUser, isSuperAdmin, viewAsRole]);

  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      realUser, 
      viewAsRole, 
      setViewAsRole, 
      isSuperAdmin, 
      mustChangePassword, 
      isInitializing, 
      login, 
      logout, 
      passwordChanged, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
