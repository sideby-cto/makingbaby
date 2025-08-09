
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, RotateCcw } from 'lucide-react';

interface CardDealingControlsSectionProps {
  selectedUsersCount: number;
  isDealing: boolean;
  onDealCards: () => void;
  onShuffleDeck: () => void;
}

export const CardDealingControlsSection: React.FC<CardDealingControlsSectionProps> = ({
  selectedUsersCount,
  isDealing,
  onDealCards,
  onShuffleDeck
}) => {
  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
      <h3 className="text-lg font-semibold mb-4 text-green-900">3. Deal Cards</h3>
      <div className="flex justify-center space-x-4">
        <Button
          onClick={onDealCards}
          disabled={selectedUsersCount === 0 || isDealing}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Deal Cards ({selectedUsersCount} users)
        </Button>
        
        <Button
          onClick={onShuffleDeck}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Shuffle Deck
        </Button>
      </div>
    </div>
  );
};
