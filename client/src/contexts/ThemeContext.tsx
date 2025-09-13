import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trivia-spark-theme');
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Function to get system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update resolved theme based on current theme setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(getSystemTheme());
      } else {
        setResolvedTheme(theme as ResolvedTheme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes when theme is set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    
    // Update CSS custom property for theme-aware components
    root.style.setProperty('--theme', resolvedTheme);
    
    // Store theme preference
    localStorage.setItem('trivia-spark-theme', theme);
  }, [theme, resolvedTheme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      resolvedTheme, 
      setTheme: handleSetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { type Theme, type ResolvedTheme };