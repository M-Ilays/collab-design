import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import getUser from "../getUser";

const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("collabToken");
      if (token) {
        try {
          const userData = await getUser(token);
          setUser(userData ? { ...userData, token } : null);
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
          localStorage.removeItem("collabToken");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    setUser,
    login: async (token) => {
      localStorage.setItem("collabToken", token);
      const userData = await getUser(token);
      setUser({ ...userData, token });
    },
    logout: () => {
      localStorage.removeItem("collabToken");
      localStorage.setItem("collabDarkMode", false);
      
      setUser(null);
      // Remove the navigate call here
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to access AuthContext
export const useAuth = () => useContext(AuthContext);
