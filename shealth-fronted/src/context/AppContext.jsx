
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();



export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user,         setUser]         = useState(null);   
  const [role,         setRole]         = useState(null);   
  const [language,     setLanguage]     = useState('English');
  const [aiReport,     setAiReport]     = useState(null);   
  const [notification, setNotification] = useState(null);   

  
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
