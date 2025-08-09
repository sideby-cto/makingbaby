
// Journey stage definitions and helper functions

// Available journey stages
export const stages = [
  'new', 
  'reflection_completed', 
  'matched', 
  'scheduled', 
  'conversation', 
  'active',
  'inactive'
];

/**
 * Convert a technical journey stage name to a human-readable label
 */
export const getJourneyStageLabel = (stage: string): string => {
  const stageLabels: Record<string, string> = {
    'new': 'New User',
    'reflection_completed': 'Reflection Completed',
    'matched': 'Matched',
    'scheduled': 'Meeting Scheduled',
    'conversation': 'In Conversation',
    'active': 'Active User',
    'inactive': 'Inactive User'
  };
  
  return stageLabels[stage] || stage;
};

/**
 * Get color classes for each journey stage
 */
export const getStageColors = (stage: string): { bg: string, text: string, border: string } => {
  const colorMap: Record<string, { bg: string, text: string, border: string }> = {
    'new': { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    'reflection_completed': { 
      bg: 'bg-purple-100', 
      text: 'text-purple-800',
      border: 'border-purple-200'
    },
    'matched': { 
      bg: 'bg-green-100', 
      text: 'text-green-800',
      border: 'border-green-200'
    },
    'scheduled': { 
      bg: 'bg-amber-100', 
      text: 'text-amber-800',
      border: 'border-amber-200'
    },
    'conversation': { 
      bg: 'bg-orange-100', 
      text: 'text-orange-800',
      border: 'border-orange-200'
    },
    'active': { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-800',
      border: 'border-emerald-200'
    },
    'inactive': { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      border: 'border-gray-200'
    }
  };
  
  return colorMap[stage] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
};

/**
 * Get the next stage in the journey progression
 */
export const getNextStage = (currentStage: string): string | null => {
  const index = stages.indexOf(currentStage);
  if (index === -1 || index === stages.length - 1) {
    return null;
  }
  return stages[index + 1];
};

/**
 * Get the previous stage in the journey progression
 */
export const getPreviousStage = (currentStage: string): string | null => {
  const index = stages.indexOf(currentStage);
  if (index <= 0) {
    return null;
  }
  return stages[index - 1];
};
