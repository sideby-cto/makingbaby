
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlayingCard } from './PlayingCard';
import { DealingResults } from './DealingResults';
import { UserSelectionSection } from './UserSelectionSection';
import { SelectedUsersSection } from './SelectedUsersSection';
import { CardDealingMatchingArea } from './CardDealingMatchingArea';
import { PreMatchTouchpointAnalysis } from './PreMatchTouchpointAnalysis';
import { TranscriptInfoDisplay } from './TranscriptInfoDisplay';
import { DragDropDebugPanel } from './DragDropDebugPanel';
import { Profile } from '../types/matchmaking';
import { Shuffle, Users, Sparkles } from 'lucide-react';
import { Card as CardType } from './types';

interface CardDeckUser {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  teachingExperience: string;
  flowActivity: string;
  hasReflection: boolean;
  cardSuit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  cardValue: number;
  profile: Profile;
}

// Helper function to convert numeric card value to proper rank type
const getCardRank = (value: number): CardType['rank'] => {
  switch (value) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return value.toString() as CardType['rank'];
  }
};

export const EnhancedCardDealingView: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [dealtCards, setDealtCards] = useState<CardDeckUser[]>([]);
  const [isDealing, setIsDealing] = useState(false);

  const handleUserSelect = (user: Profile) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else if (selectedUsers.length < 6) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleDealCards = () => {
    if (selectedUsers.length === 0) return;
    
    setIsDealing(true);
    
    // Simulate dealing animation
    setTimeout(() => {
      const cards: CardDeckUser[] = selectedUsers.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        email: user.email,
        subjects: user.subjects || [],
        teachingExperience: user.teaching_experience || 'Not specified',
        flowActivity: user.primary_flow_activity || 'Not specified',
        hasReflection: user.has_completed_reflection || false,
        cardSuit: ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)] as 'hearts' | 'diamonds' | 'clubs' | 'spades',
        cardValue: Math.floor(Math.random() * 13) + 1,
        profile: user
      }));
      
      setDealtCards(cards);
      setIsDealing(false);
    }, 1500);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setDealtCards([]);
  };

  const handleResetCards = () => {
    setDealtCards([]);
  };

  // Convert CardDeckUser to the format expected by DealingResults
  const userCards = dealtCards.map(cardUser => ({
    userId: cardUser.id,
    userName: cardUser.name,
    card: {
      suit: cardUser.cardSuit,
      rank: getCardRank(cardUser.cardValue),
      color: (cardUser.cardSuit === 'hearts' || cardUser.cardSuit === 'diamonds') ? 'red' as const : 'black' as const
    }
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-6 w-6" />
            Enhanced Card Dealing Matchmaker
          </CardTitle>
          <p className="text-purple-700">
            Select users, deal cards, and analyze potential matches with AI-powered insights
          </p>
        </CardHeader>
      </Card>

      {/* Debug Panel */}
      <DragDropDebugPanel />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: User Selection and Card Dealing */}
        <div className="space-y-6">
          <UserSelectionSection 
            onUserSelect={handleUserSelect}
            selectedUserIds={selectedUsers.map(u => u.id)}
          />
          
          <SelectedUsersSection 
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onClearAll={() => setSelectedUsers([])}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Card Dealing Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDealCards}
                  disabled={selectedUsers.length === 0 || isDealing}
                  className="flex-1"
                >
                  {isDealing ? (
                    <>
                      <Shuffle className="h-4 w-4 mr-2 animate-spin" />
                      Dealing Cards...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Deal Cards ({selectedUsers.length})
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={clearSelection}
                  variant="outline"
                  disabled={selectedUsers.length === 0 && dealtCards.length === 0}
                >
                  Clear All
                </Button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} 
                  {selectedUsers.length >= 6 && ' (maximum reached)'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results and Analysis */}
        <div className="space-y-6">
          {dealtCards.length > 0 && (
            <>
              <DealingResults 
                userCards={userCards} 
                onReset={handleResetCards}
              />
              <CardDealingMatchingArea />
            </>
          )}
        </div>
      </div>

      {/* Pre-Match Analysis Section */}
      {dealtCards.length >= 2 && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pre-Match Analysis Tools
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Show analysis for first two dealt cards as an example */}
              <PreMatchTouchpointAnalysis 
                user1={dealtCards[0].profile}
                user2={dealtCards[1].profile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
