
import React, { useState, useCallback } from 'react';
import { Card, UserCard, DealingState } from './types';
import { CardDeck } from './CardDeck';
import { DealingResults } from './DealingResults';

// Define the minimal user type we need
interface SimpleUser {
  id: string;
  full_name?: string;
  email?: string;
}

interface CardDealingViewProps {
  selectedUsers: SimpleUser[];
  onUserSelect: (userId: string) => void;
}

export const CardDealingView: React.FC<CardDealingViewProps> = ({ 
  selectedUsers, 
  onUserSelect 
}) => {
  // Create standard 52-card deck
  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Card['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({
          suit,
          rank,
          color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
        });
      });
    });
    
    return deck;
  };

  const [dealingState, setDealingState] = useState<DealingState>({
    deck: createDeck(),
    dealtCards: [],
    isDealing: false
  });

  const shuffleDeck = useCallback(() => {
    setDealingState(prev => {
      const newDeck = [...prev.deck];
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }
      return { ...prev, deck: newDeck };
    });
  }, []);

  const dealCards = useCallback(() => {
    if (selectedUsers.length === 0) return;
    
    setDealingState(prev => {
      const availableIndices = prev.deck
        .map((_, index) => index)
        .filter(index => !prev.dealtCards.some(dealt => dealt.userId === selectedUsers[index % selectedUsers.length]?.id));
      
      const newDealtCards: UserCard[] = [];
      const dealtIndices: string[] = [];
      
      selectedUsers.forEach((user, userIndex) => {
        if (userIndex < availableIndices.length) {
          const cardIndex = availableIndices[userIndex];
          newDealtCards.push({
            userId: user.id,
            userName: user.full_name || user.email || 'Unknown User',
            card: prev.deck[cardIndex]
          });
          dealtIndices.push(`${cardIndex}`);
        }
      });
      
      return {
        ...prev,
        dealtCards: newDealtCards,
        isDealing: false
      };
    });
  }, [selectedUsers]);

  const resetCards = useCallback(() => {
    setDealingState(prev => ({
      ...prev,
      dealtCards: [],
      isDealing: false
    }));
  }, []);

  const dealtCardIndices = dealingState.dealtCards.map((_, index) => `${index}`);

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Deal the Cards</h2>
        <p className="text-gray-600">
          Select users and deal them cards from a standard 52-card deck
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={dealCards}
          disabled={selectedUsers.length === 0 || dealingState.isDealing}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Deal Cards ({selectedUsers.length} users)
        </button>
        
        <button
          onClick={shuffleDeck}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Shuffle Deck
        </button>
      </div>

      <CardDeck 
        deck={dealingState.deck}
        dealtCards={dealtCardIndices}
        onShuffle={shuffleDeck}
      />

      <DealingResults 
        userCards={dealingState.dealtCards}
        onReset={resetCards}
      />

      {selectedUsers.length === 0 && (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            No users selected. Please select users from the main matchmaker view to deal cards.
          </p>
        </div>
      )}
    </div>
  );
};
