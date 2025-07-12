'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {resolvedTheme === 'dark' ? '☀️' : '🌙'}
      </span>
    </Button>
  );
}