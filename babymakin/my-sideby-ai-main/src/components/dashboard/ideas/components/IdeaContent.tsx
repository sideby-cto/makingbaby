
import React from "react";

interface IdeaContentProps {
  content: string;
  truncate?: boolean;
  maxLength?: number;
}

export const IdeaContent = ({ 
  content, 
  truncate = false, 
  maxLength = 200 
}: IdeaContentProps) => {
  const displayContent = truncate && content.length > maxLength 
    ? content.substring(0, maxLength) + "..."
    : content;

  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {displayContent}
      </p>
    </div>
  );
};
