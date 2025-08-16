import { createContext, useContext, useEffect, useState } from "react";
import { useAppearance } from "@/store/appearanceStore";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { setAppearance, appearance } = useAppearance();

  const [theme, _setTheme] = useState<Theme>(appearance.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (theme: Theme) => {
      root.classList.remove("light", "dark"); // Remove existing theme classes
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const effectiveTheme = theme === "system" ? systemTheme : theme;
      root.classList.add(effectiveTheme); // Add the new theme class
    };

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    applyTheme(theme);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (theme: Theme) => {
    setAppearance({ theme });
    _setTheme(theme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
