import React from 'react';

interface ConversationIconProps {
  className?: string;
}

export const ConversationIcon: React.FC<ConversationIconProps> = ({ className = "h-4 w-4" }) => {
  return (
    <svg className={className} viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            .cls-1 {
              fill: #f99eb3;
              isolation: isolate;
            }
            .cls-2 {
              fill: none;
              stroke: #1a40f4;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 11px;
            }
          `}
        </style>
      </defs>
      <path className="cls-1" d="M77,137v40c0,4.42,3.58,8,8,8h96.42l39.58,32V89c0-4.42-3.58-8-8-8h-40v48c0,4.42-3.58,8-8,8h-88Z"/>
      <path className="cls-2" d="M68.58,137l-39.58,32V41c0-4.42,3.58-8,8-8h128c4.42,0,8,3.58,8,8v88c0,4.42-3.58,8-8,8h-96.42Z"/>
      <path className="cls-2" d="M77,137v40c0,4.42,3.58,8,8,8h96.42l39.58,32V89c0-4.42-3.58-8-8-8h-40"/>
    </svg>
  );
};