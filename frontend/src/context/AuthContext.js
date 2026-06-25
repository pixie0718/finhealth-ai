import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fh_token");
    if (!token) { setLoading(false); return; }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("fh_token"))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem("fh_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("fh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
