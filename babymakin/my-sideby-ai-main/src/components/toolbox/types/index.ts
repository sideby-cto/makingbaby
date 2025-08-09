
import { Tool } from '@/types/tools';

export type { Tool };

export interface ToolboxContextType {
  favorites: Tool[];
  addFavorite: (tool: Tool) => void;
  removeFavorite: (toolId: string) => void;
}
