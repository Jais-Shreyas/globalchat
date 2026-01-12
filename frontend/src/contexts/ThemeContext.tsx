import { createContext, useContext, useState } from "react";

type ThemeContextType = {
  dark: boolean;
  changeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState<boolean>((localStorage.getItem('theme') ?? 'dark') === 'dark');
  const changeMode = () => {
    localStorage.setItem('theme', !dark ? 'dark' : 'light');
    document.body.style.backgroundColor = dark ? "#f8f9fa" : "#212529";
    setDark(!dark);
  }

  return (
    <ThemeContext.Provider value={{ dark, changeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}