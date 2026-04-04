import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { ShelterFilters, CrisisAlert } from '../types';

interface AppContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  shelterFilters: ShelterFilters;
  setShelterFilters: (filters: ShelterFilters) => void;
  activeAlerts: CrisisAlert[];
  setActiveAlerts: (alerts: CrisisAlert[]) => void;
  userCity: string;
  setUserCity: (city: string) => void;
}

const defaultFilters: ShelterFilters = {
  tags: [],
  minRating: 0,
  hasAvailability: false,
  city: '',
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shelterFilters, setShelterFilters] = useState<ShelterFilters>(defaultFilters);
  const [activeAlerts, setActiveAlerts] = useState<CrisisAlert[]>([]);
  const [userCity, setUserCity] = useState('');

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        shelterFilters,
        setShelterFilters,
        activeAlerts,
        setActiveAlerts,
        userCity,
        setUserCity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
