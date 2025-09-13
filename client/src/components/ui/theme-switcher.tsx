import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
}

export function ThemeSwitcher({ 
  className, 
  variant = 'dropdown',
  size = 'default' 
}: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  // Simple toggle variant (cycles through light -> dark -> system)
  if (variant === 'button') {
    const cycleTheme = () => {
      const themeOrder: Theme[] = ['light', 'dark', 'system'];
      const currentIndex = themeOrder.indexOf(theme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      setTheme(themeOrder[nextIndex]);
    };

    const getIcon = () => {
      if (theme === 'system') {
        return <Monitor className={cn(iconSize, 'transition-transform duration-300')} />;
      }
      return resolvedTheme === 'dark' 
        ? <Moon className={cn(iconSize, 'transition-transform duration-300')} /> 
        : <Sun className={cn(iconSize, 'transition-transform duration-300')} />;
    };

    const getTooltip = () => {
      const nextTheme = {
        light: 'Switch to dark mode',
        dark: 'Switch to system mode', 
        system: 'Switch to light mode'
      }[theme];
      return nextTheme;
    };

    return (
      <Button
        variant="ghost"
        size={size}
        onClick={cycleTheme}
        className={cn(
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          className
        )}
        title={getTooltip()}
      >
        {getIcon()}
        <span className="sr-only">{getTooltip()}</span>
      </Button>
    );
  }

  // Dropdown variant with all options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={size}
          className={cn(
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            className
          )}
        >
          {theme === 'system' ? (
            <Monitor className={cn(iconSize, 'transition-transform duration-300')} />
          ) : resolvedTheme === 'dark' ? (
            <Moon className={cn(iconSize, 'transition-transform duration-300')} />
          ) : (
            <Sun className={cn(iconSize, 'transition-transform duration-300')} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'light' && 'bg-accent'
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'dark' && 'bg-accent'
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            theme === 'system' && 'bg-accent'
          )}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;