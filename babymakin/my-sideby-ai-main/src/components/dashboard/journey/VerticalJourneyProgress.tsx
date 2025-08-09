
import React from 'react';
import { JourneyData } from '@/hooks/user-journey/types';
import { PacingLevel } from '@/components/dashboard/pacing/types';
import { Compass, Target, CheckCircle, Trophy } from 'lucide-react';

export interface VerticalJourneyProgressProps {
  journeyData: JourneyData | undefined;
  pacingLevel: PacingLevel;
}

export const VerticalJourneyProgress: React.FC<VerticalJourneyProgressProps> = ({
  journeyData,
  pacingLevel
}) => {
  // Calculate progress based on journey stage
  const getProgressValue = () => {
    const stage = journeyData?.stage;
    
    switch (stage) {
      case 'new':
        return 10; // Just starting
      case 'reflection_completed':
        return 20; // Reflection completed but not yet introduced
      case 'introduced':
        return 30; // Introduced but not yet matched
      case 'matched':
        return 40; // Matched but not scheduled
      case 'scheduled':
        return 60; // Scheduled but not had conversation
      case 'conversation':
        return 80; // Had conversation but not completed
      case 'active':
        return 100; // Fully active/completed
      default:
        return 10;
    }
  };

  // Determine color and styling based on pacing level and completion
  const getProgressStyling = () => {
    const isComplete = journeyData?.stage === 'active';
    
    if (isComplete) {
      return {
        bgGradient: 'bg-gradient-to-r from-sideby-teal-400 via-sideby-blue-500 to-sideby-burgundy-500',
        textColor: 'text-sideby-teal-700',
        icon: Trophy,
        iconColor: 'text-sideby-teal-600'
      };
    }
    
    switch (pacingLevel) {
      case 'light':
        return {
          bgGradient: 'bg-gradient-to-r from-sideby-blue-400 to-sideby-blue-600',
          textColor: 'text-sideby-blue-700',
          icon: Compass,
          iconColor: 'text-sideby-blue-600'
        };
      case 'moderate':
        return {
          bgGradient: 'bg-gradient-to-r from-sideby-orange-400 to-sideby-orange-600',
          textColor: 'text-sideby-orange-700',
          icon: Target,
          iconColor: 'text-sideby-orange-600'
        };
      case 'consistent':
        return {
          bgGradient: 'bg-gradient-to-r from-sideby-teal-400 to-sideby-teal-600',
          textColor: 'text-sideby-teal-700',
          icon: CheckCircle,
          iconColor: 'text-sideby-teal-600'
        };
      case 'deep_dive':
        return {
          bgGradient: 'bg-gradient-to-r from-sideby-burgundy-500 to-sideby-burgundy-700',
          textColor: 'text-sideby-burgundy-700',
          icon: Trophy,
          iconColor: 'text-sideby-burgundy-600'
        };
      default:
        return {
          bgGradient: 'bg-gradient-to-r from-sideby-orange-400 to-sideby-orange-600',
          textColor: 'text-sideby-orange-700',
          icon: Target,
          iconColor: 'text-sideby-orange-600'
        };
    }
  };

  const progress = getProgressValue();
  const styling = getProgressStyling();
  const Icon = styling.icon;

  const getStageLabel = () => {
    const stage = journeyData?.stage;
    switch (stage) {
      case 'new': return 'Getting Started';
      case 'reflection_completed': return 'Reflection Complete';
      case 'introduced': return 'Introduced';
      case 'matched': return 'Matched with Peers';
      case 'scheduled': return 'Session Scheduled';
      case 'conversation': return 'In Conversation';
      case 'active': return 'Fully Active';
      default: return 'Beginning Journey';
    }
  };

  const getPacingLabel = () => {
    switch (pacingLevel) {
      case 'light': return 'Light Pace';
      case 'moderate': return 'Moderate Pace';
      case 'consistent': return 'Consistent Pace';
      case 'deep_dive': return 'Deep Dive';
      default: return 'Moderate Pace';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-gradient-to-br from-sideby-orange-100 to-sideby-blue-100 rounded-lg`}>
          <Icon className={`h-5 w-5 ${styling.iconColor}`} />
        </div>
        <div>
          <h3 className="font-black text-lg text-sideby-text-primary tracking-wide">Your Learning Journey</h3>
          <p className="text-sm text-sideby-text-secondary font-semibold">{getPacingLabel()}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-sideby-text-primary">{getStageLabel()}</span>
          <span className={`text-sm font-black ${styling.textColor}`}>{progress}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full ${styling.bgGradient} transition-all duration-700 ease-out shadow-sm relative overflow-hidden`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        </div>
        
        <div className="flex justify-between text-xs font-semibold text-sideby-text-muted">
          <span>Starting</span>
          <span>Active Learning</span>
        </div>
      </div>

      {progress === 100 && (
        <div className="bg-gradient-to-r from-sideby-teal-50 to-sideby-blue-50 border-2 border-sideby-teal-200 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-sideby-teal-600" />
            <span className="text-sm font-bold text-sideby-teal-700">Congratulations! You're fully active on sideby!</span>
          </div>
        </div>
      )}
    </div>
  );
};
