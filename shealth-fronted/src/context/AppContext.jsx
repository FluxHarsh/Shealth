import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  // Rehydrate from localStorage so page refresh doesn't log out
  const [user,         setUser]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('shealth_user')) || null; } catch { return null; }
  });
  const [role,         setRole]         = useState(() => {
    try { return localStorage.getItem('shealth_role') || null; } catch { return null; }
  });
  const [language,     setLanguage]     = useState('English');
  const [aiReport,     setAiReport]     = useState(null);
  const [notification, setNotification] = useState(null);

  // Persist user and role to localStorage whenever they change
  useEffect(() => {
    if (user) localStorage.setItem('shealth_user', JSON.stringify(user));
    else localStorage.removeItem('shealth_user');
  }, [user]);

  useEffect(() => {
    if (role) localStorage.setItem('shealth_role', role);
    else localStorage.removeItem('shealth_role');
  }, [role]);

  const addNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setAiReport(null);
    localStorage.removeItem('shealth_token');
    localStorage.removeItem('shealth_user');
    localStorage.removeItem('shealth_role');
  };

  return (
    <AppContext.Provider value={{
      user, role, language, aiReport, notification,
      setUser, setRole, setLanguage, setAiReport,
      login, logout, addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}