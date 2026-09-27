import React, { createContext, useContext, useState, useEffect } from "react";

// Create the Theme Context
const ThemeContext = createContext();

// Create a Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("collabDarkMode");
    return stored === null ? false : stored === "true";
  });

  useEffect(() => {
    // Apply the 'dark' class to <html> when isDarkMode is true
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("collabDarkMode", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setLightTheme = () => {
    setIsDarkMode(false);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook for Consuming Theme Context
export const useTheme = () => useContext(ThemeContext);
