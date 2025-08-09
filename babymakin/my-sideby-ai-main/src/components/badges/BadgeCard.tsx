import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Medal } from 'lucide-react';
import { Badge, UserBadge } from '@/types/database';

interface BadgeCardProps {
  badge: Badge;
  userBadge?: UserBadge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, userBadge }) => {
  const isCompleted = userBadge?.is_completed || false;
  const progress = userBadge?.progress || 0;
  
  const getBadgeIcon = () => {
    switch (badge.icon_name) {
      case 'Trophy':
        return <Trophy className={`h-8 w-8 ${isCompleted ? 'text-palette-highlighter-yellow' : 'text-muted-foreground'}`} />;
      case 'Medal':
        return <Medal className={`h-8 w-8 ${isCompleted ? 'text-palette-highlighter-yellow' : 'text-muted-foreground'}`} />;
      default:
        return <Award className={`h-8 w-8 ${isCompleted ? 'text-palette-highlighter-yellow' : 'text-muted-foreground'}`} />;
    }
  };

  return (
    <Card className={`overflow-hidden transition-all ${isCompleted ? 'border-palette-highlighter-yellow' : 'border-border'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{badge.name}</CardTitle>
          {getBadgeIcon()}
        </div>
        <CardDescription className="line-clamp-2 h-10">{badge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <Progress 
            value={progress * 100} 
            className="h-2 [&>div]:bg-palette-highlighter-yellow" 
          />
        </div>
      </CardContent>
      {badge.reward_description && (
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
          <div className="w-full">
            <p className="font-medium">Reward:</p>
            <p>{badge.reward_description}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default BadgeCard;