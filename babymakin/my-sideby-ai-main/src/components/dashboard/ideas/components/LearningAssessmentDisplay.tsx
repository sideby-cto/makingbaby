
import React from "react";

interface LearningTarget {
  target: string;
}

interface LearningAssessment {
  type: string;
  summary: string;
  learningTargets: LearningTarget[];
  nextSteps?: {
    learningTargets?: LearningTarget[];
  };
}

interface LearningAssessmentDisplayProps {
  jsonContent: LearningAssessment | any;
}

export const LearningAssessmentDisplay = ({ jsonContent }: LearningAssessmentDisplayProps) => {
  if (!jsonContent || jsonContent.type !== "learning_assessment") {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-black dark:text-gray-300">
        {jsonContent.summary}
      </p>
      <div>
        <h4 className="text-sm font-medium mb-1">Key Learning Targets:</h4>
        <ul className="list-disc pl-5 text-sm">
          {jsonContent.learningTargets.map((target: LearningTarget, index: number) => (
            <li key={index}>{target.target}</li>
          ))}
        </ul>
      </div>
      {jsonContent.nextSteps && jsonContent.nextSteps.learningTargets && (
        <div>
          <h4 className="text-sm font-medium mb-1">Next Steps:</h4>
          <ul className="list-disc pl-5 text-sm">
            {jsonContent.nextSteps.learningTargets.map((target: LearningTarget, index: number) => (
              <li key={index}>{target.target}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
