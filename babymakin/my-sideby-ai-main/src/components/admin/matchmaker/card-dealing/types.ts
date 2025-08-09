
export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  color: 'red' | 'black';
}

export interface UserCard {
  userId: string;
  userName: string;
  card: Card;
}

export interface DealingState {
  deck: Card[];
  dealtCards: UserCard[];
  isDealing: boolean;
}
