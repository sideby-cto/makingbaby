
import React from 'react';
import { useBadges } from '@/hooks/useBadges';
import { BadgeCard } from '../badges/BadgeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Award } from 'lucide-react';
import { Badge, UserBadge } from '@/types/database';

interface BadgesSectionProps {
  userId: string | null;
  searchQuery?: string;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ userId, searchQuery = "" }) => {
  const { badges, userBadges, isLoading } = useBadges(userId);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your Badges</h2>
          <p className="text-muted-foreground mt-2">
            Earn badges by using sideby tools and engaging with the platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Filter badges based on search query
  const filteredBadges = badges.filter(badge => 
    badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Map badges to their user badge status
  const badgesWithStatus = filteredBadges.map((badge) => {
    const userBadge = userBadges.find((ub) => ub.badge_id === badge.id);
    return { badge, userBadge };
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Your Badges</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Earn badges by completing activities with sideby tools. Complete your "Back to School Compass" badge by finishing all four learning quartiles.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {badgesWithStatus.map(({ badge, userBadge }) => (
          <BadgeCard key={badge.id} badge={badge} userBadge={userBadge} userId={userId} />
        ))}
      </div>
    </div>
  );
};
