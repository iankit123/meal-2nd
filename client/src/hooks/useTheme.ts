import { useEffect } from 'react';
import { COLORS } from '../styles/colors';

export function useTheme() {
  useEffect(() => {
    const colors = COLORS.getColors();
    const root = document.documentElement;
    
    // Update CSS custom properties dynamically
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, []);

  return COLORS.getColors();
}