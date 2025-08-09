
export const getStageLabel = (stage: string): string => {
  // This function now primarily serves as a fallback
  // The main labels should come from the database configuration
  const stageLabels: Record<string, string> = {
    'new': 'New',
    'reflection_completed': 'Reflection Completed',
    'matched': 'Matched',
    'scheduled': 'Scheduled',
    'conversation': 'In Conversation',
    'active': 'Active',
    'inactive': 'Inactive'
  };
  
  return stageLabels[stage] || stage.replace('_', ' ');
};

export const getStageColor = (stage: string): string => {
  // This function now primarily serves as a fallback
  // The main colors should come from the database configuration
  const stageColors: Record<string, string> = {
    'new': 'bg-blue-50 border-blue-200',
    'reflection_completed': 'bg-purple-50 border-purple-200',
    'matched': 'bg-green-50 border-green-200',
    'scheduled': 'bg-yellow-50 border-yellow-200',
    'conversation': 'bg-orange-50 border-orange-200',
    'active': 'bg-emerald-50 border-emerald-200',
    'inactive': 'bg-gray-50 border-gray-200'
  };
  
  return stageColors[stage] || 'bg-gray-50 border-gray-200';
};

export const getPriorityLabel = (daysSinceRegistration: number): { label: string; color: string } => {
  if (daysSinceRegistration > 30) {
    return { label: 'High', color: 'bg-red-100 text-red-800' };
  } else if (daysSinceRegistration > 7) {
    return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  }
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInDays = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return '1 day ago';
  } else {
    return `${diffInDays} days ago`;
  }
};
