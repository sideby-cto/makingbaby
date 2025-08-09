
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tool } from '@/types/tools';

interface ToolboxContextType {
  favorites: Tool[];
  addFavorite: (tool: Tool) => void;
  removeFavorite: (toolId: string) => void;
}

const ToolboxContext = createContext<ToolboxContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
});

export const useToolbox = () => useContext(ToolboxContext);

interface ToolboxProviderProps {
  children: ReactNode;
}

export const ToolboxProvider: React.FC<ToolboxProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Tool[]>([]);

  const addFavorite = (tool: Tool) => {
    setFavorites(prev => {
      if (prev.some(item => item.id === tool.id)) return prev;
      return [...prev, tool];
    });
  };

  const removeFavorite = (toolId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== toolId));
  };

  return (
    <ToolboxContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </ToolboxContext.Provider>
  );
};
