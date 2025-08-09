
import React from 'react';
interface TaskStatusMessageProps {
  hasCompletedReflection: boolean;
  hasActiveMatch?: boolean;
  approvedFlowActivity?: string;
}
export const TaskStatusMessage: React.FC<TaskStatusMessageProps> = ({
  hasCompletedReflection,
  hasActiveMatch,
  approvedFlowActivity
}) => {
  if (hasCompletedReflection && hasActiveMatch) {
    return <div className="text-sm text-gray-500 italic">
        <p>Great news! You've been matched with a learning partner. Visit the &quot;Partners&quot; tab to see your match and complete the logistical task above.</p>
      </div>;
  }
  return <div className="text-sm text-gray-500 italic">
      {hasCompletedReflection ? <p>
          We're processing your reflection to find compatible learning partners. You'll be notified when a match is found and can begin collaborating.
        </p> : <p>
          After completing your reflection, we'll be able to match you with learning partners
          strategically. You'll move on to the partners tab automatically. You'll be notified when a match is found.
        </p>}
    </div>;
};
