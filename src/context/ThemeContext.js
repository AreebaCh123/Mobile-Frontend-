import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext({
  isDark: false,
  setIsDark: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("theme:isDark")
      .then((value) => {
        if (value !== null) {
          setIsDark(value === "true");
        }
      })
      .catch(() => {});
  }, []);

  const updateTheme = (value) => {
    setIsDark(value);
    AsyncStorage.setItem("theme:isDark", value ? "true" : "false").catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}


