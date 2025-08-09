
import React from 'react';
import { UserCard } from './types';
import { PlayingCard } from './PlayingCard';

interface DealingResultsProps {
  userCards: UserCard[];
  onReset: () => void;
}

export const DealingResults: React.FC<DealingResultsProps> = ({ userCards, onReset }) => {
  if (userCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dealt Cards ({userCards.length})</h3>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset Cards
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userCards.map((userCard) => (
          <div 
            key={userCard.userId}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <PlayingCard card={userCard.card} />
            <div>
              <div className="font-medium">{userCard.userName}</div>
              <div className="text-sm text-gray-600">
                {userCard.card.rank} of {userCard.card.suit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
