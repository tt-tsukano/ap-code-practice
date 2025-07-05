import React from 'react';
import { ThemeToggle } from './theme-toggle';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Python・SQL実行環境</h1>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}