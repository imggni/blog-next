"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string | string[];
  defaultTheme?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: string[];
  value?: Record<string, string>;
}

interface ThemeContextValue {
  theme: string;
  resolvedTheme: string;
  setTheme: (theme: string) => void;
  systemTheme?: string;
  themes: string[];
  forcedTheme?: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const defaultThemes = ["light", "dark"];
const systemMediaQuery = "(prefers-color-scheme: dark)";

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(systemMediaQuery).matches ? "dark" : "light";
}

function applyTheme(
  theme: string,
  { attribute, themes, value, enableColorScheme }: Pick<ThemeProviderProps, "attribute" | "themes" | "value" | "enableColorScheme">,
) {
  const root = document.documentElement;
  const actualTheme = theme === "system" ? getSystemTheme() : theme;
  const themeList = themes ?? defaultThemes;
  const themeClass = value?.[actualTheme] ?? actualTheme;

  if (attribute === "class" || (Array.isArray(attribute) && attribute.includes("class"))) {
    root.classList.remove(...themeList.map((item) => value?.[item] ?? item));
    if (themeClass) {
      root.classList.add(themeClass);
    }
  } else if (attribute) {
    const attrNames = Array.isArray(attribute) ? attribute : [attribute];
    attrNames.forEach((attrName) => {
      if (attrName.startsWith("data-")) {
        if (themeClass) {
          root.setAttribute(attrName, themeClass);
        } else {
          root.removeAttribute(attrName);
        }
      } else {
        root.setAttribute(attrName, themeClass);
      }
    });
  }

  if (enableColorScheme) {
    root.style.colorScheme = actualTheme;
  }
}

function readThemeFromStorage(storageKey: string) {
  try {
    return window.localStorage.getItem(storageKey) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeThemeToStorage(storageKey: string, theme: string) {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // ignore storage errors
  }
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  enableColorScheme = true,
  storageKey = "theme",
  themes = defaultThemes,
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(() => readThemeFromStorage(storageKey) ?? defaultTheme);
  const [systemTheme, setSystemTheme] = useState<string>(() => getSystemTheme());

  useEffect(() => {
    const media = window.matchMedia(systemMediaQuery);
    const listener = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    applyTheme(theme, { attribute, themes, value, enableColorScheme });
    if (theme) {
      writeThemeToStorage(storageKey, theme);
    }
  }, [theme, attribute, themes, value, enableColorScheme, storageKey]);

  const setTheme = useCallback(
    (nextTheme: string) => {
      setThemeState(nextTheme);
    },
    [],
  );

  const resolvedTheme = useMemo(
    () => (theme === "system" && enableSystem ? systemTheme : theme),
    [enableSystem, systemTheme, theme],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      systemTheme,
      themes,
      forcedTheme: undefined,
    }),
    [theme, resolvedTheme, setTheme, systemTheme, themes],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
