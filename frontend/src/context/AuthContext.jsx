import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);
const IMPERSONATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 phut

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [realUser, setRealUser] = useState(() => {
    const token = sessionStorage.getItem('touris_token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        return { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
      }
      sessionStorage.removeItem('touris_token');
      sessionStorage.removeItem('touris_must_change_password');
      sessionStorage.removeItem('touris_view_as_role');
      sessionStorage.removeItem('touris_view_as_role_start');
    }
    return null;
  });

  const [viewAsRole, setViewAsRoleState] = useState(() => sessionStorage.getItem('touris_view_as_role') || null);
  const [mustChangePassword, setMustChangePassword] = useState(() => sessionStorage.getItem('touris_must_change_password') === 'true');
  const [isInitializing, setIsInitializing] = useState(false);

  // Timeout 30 phút tự động kết thúc phiên impersonation (giả lập)
  useEffect(() => {
    if (!viewAsRole) return;

    const startTimeStr = sessionStorage.getItem('touris_view_as_role_start');
    const startTime = startTimeStr ? parseInt(startTimeStr, 10) : Date.now();

    if (Date.now() - startTime >= IMPERSONATION_TIMEOUT_MS) {
      sessionStorage.removeItem('touris_view_as_role');
      sessionStorage.removeItem('touris_view_as_role_start');
      setViewAsRoleState(null);
      return;
    }

    const remaining = IMPERSONATION_TIMEOUT_MS - (Date.now() - startTime);
    const timer = setTimeout(() => {
      sessionStorage.removeItem('touris_view_as_role');
      sessionStorage.removeItem('touris_view_as_role_start');
      setViewAsRoleState(null);
    }, remaining);

    return () => clearTimeout(timer);
  }, [viewAsRole]);

  const setViewAsRole = (role) => {
    // Chặn impersonate super_admin khác
    if (!role || role === 'super_admin') {
      sessionStorage.removeItem('touris_view_as_role');
      sessionStorage.removeItem('touris_view_as_role_start');
      setViewAsRoleState(null);
    } else {
      sessionStorage.setItem('touris_view_as_role', role);
      sessionStorage.setItem('touris_view_as_role_start', String(Date.now()));
      setViewAsRoleState(role);
    }
  };

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
    sessionStorage.removeItem('touris_view_as_role_start');
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
