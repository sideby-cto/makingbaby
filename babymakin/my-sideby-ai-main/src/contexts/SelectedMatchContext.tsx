import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SelectedMatchContextType {
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
}

const SelectedMatchContext = createContext<SelectedMatchContextType | undefined>(undefined);

export const SelectedMatchProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Load initial value from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('selectedMatchId');
    if (stored) {
      setSelectedMatchId(stored);
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (selectedMatchId) {
      localStorage.setItem('selectedMatchId', selectedMatchId);
    } else {
      localStorage.removeItem('selectedMatchId');
    }
  }, [selectedMatchId]);

  return (
    <SelectedMatchContext.Provider value={{ selectedMatchId, setSelectedMatchId }}>
      {children}
    </SelectedMatchContext.Provider>
  );
};

export const useSelectedMatch = () => {
  const context = useContext(SelectedMatchContext);
  if (!context) {
    throw new Error('useSelectedMatch must be used within a SelectedMatchProvider');
  }
  return context;
};
