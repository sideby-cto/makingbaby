import React from 'react';
import { useBadges } from '@/hooks/useBadges';
import BadgeCard from './BadgeCard';
import { Badge } from '@/types/database';
import { Award } from 'lucide-react';

interface BadgesSectionProps {
  userId: string;
  searchQuery?: string;
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ userId, searchQuery = '' }) => {
  const { badges, userBadges, isLoading, error } = useBadges(userId);
  
  const filteredBadges = badges.filter(badge => 
    badge.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    badge.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <p className="text-destructive">Failed to load badges</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message || "Unknown error occurred"}</p>
      </div>
    );
  }

  if (filteredBadges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <Award className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">
          {searchQuery ? 'No badges match your search' : 'No badges available yet'}
        </p>
      </div>
    );
  }

  const getUserBadgeForBadge = (badge: Badge) => {
    return userBadges.find(userBadge => userBadge.badge_id === badge.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredBadges.map(badge => (
        <BadgeCard 
          key={badge.id} 
          badge={badge} 
          userBadge={getUserBadgeForBadge(badge)}
        />
      ))}
    </div>
  );
};

export default BadgesSection;