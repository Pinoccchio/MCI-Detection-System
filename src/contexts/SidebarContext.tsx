'use client';

/**
 * Sidebar Context
 * Manages sidebar collapsed state with localStorage persistence
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage on change (only after mount to avoid hydration issues)
  const toggle = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      if (mounted) {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  const setCollapsedValue = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }
  };

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggle, setCollapsed: setCollapsedValue }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
