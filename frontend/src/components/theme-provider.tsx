import { createContext, useContext, useEffect } from "react";
import { useAppearance } from "@/store/appearance-store";

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

  const theme = appearance.theme;

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark");
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      const effectiveTheme =
        currentTheme === "system" ? systemTheme : currentTheme;
      root.classList.add(effectiveTheme);
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

  const setTheme = (newTheme: Theme) => {
    setAppearance({ theme: newTheme });
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

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
