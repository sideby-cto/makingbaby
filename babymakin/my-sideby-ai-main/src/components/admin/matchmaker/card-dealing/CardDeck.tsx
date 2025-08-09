
import React, { useState } from 'react';
import { Card } from './types';
import { PlayingCard } from './PlayingCard';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface CardDeckProps {
  deck: Card[];
  dealtCards: string[];
  onShuffle: () => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({ deck, dealtCards, onShuffle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const availableCards = deck.filter((_, index) => !dealtCards.includes(`${index}`));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Cards Available: {availableCards.length}/52</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? 'Hide Cards' : 'Show All Cards'}
          </Button>
        </div>
        <Button
          onClick={onShuffle}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Shuffle
        </Button>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-13 gap-1 max-w-4xl">
          {deck.map((card, index) => (
            <PlayingCard 
              key={`${card.suit}-${card.rank}`}
              card={card}
              isDealt={dealtCards.includes(`${index}`)}
              className="text-xs"
            />
          ))}
        </div>
      )}
      
      {!isExpanded && (
        <div className="text-sm text-gray-600">
          Click "Show All Cards" to view the complete deck layout
        </div>
      )}
    </div>
  );
};
