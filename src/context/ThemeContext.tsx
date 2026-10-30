import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "cognix-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === "undefined") return defaultTheme;
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === "light" || stored === "dark" || stored === "system") {
                return stored;
            }
        } catch {
            // ignore localStorage errors
        }
        return defaultTheme;
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
        if (theme === "system") return getSystemTheme();
        return theme;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
            setResolvedTheme(effectiveTheme);

            root.classList.remove("light", "dark");
            root.classList.add(effectiveTheme);
            root.style.colorScheme = effectiveTheme;
        };

        applyTheme();

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                applyTheme();
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        try {
            localStorage.setItem(storageKey, newTheme);
        } catch {
            // ignore localStorage errors
        }
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        if (resolvedTheme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
