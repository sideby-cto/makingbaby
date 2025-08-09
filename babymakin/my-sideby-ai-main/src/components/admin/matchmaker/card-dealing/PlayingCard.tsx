
import React from 'react';
import { Card } from './types';

interface PlayingCardProps {
  card: Card;
  isDealt?: boolean;
  className?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isDealt = false, 
  className = "" 
}) => {
  const getSuitSymbol = (suit: Card['suit']) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div 
      className={`
        w-12 h-16 bg-white border border-gray-300 rounded-md 
        flex flex-col items-center justify-center text-xs font-semibold
        ${card.color === 'red' ? 'text-red-600' : 'text-black'}
        ${isDealt ? 'opacity-50 grayscale' : 'shadow-sm'}
        ${className}
      `}
    >
      <div>{card.rank}</div>
      <div>{getSuitSymbol(card.suit)}</div>
    </div>
  );
};
