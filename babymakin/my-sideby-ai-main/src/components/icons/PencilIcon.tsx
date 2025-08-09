import React from 'react';
import { cn } from '@/lib/utils';

interface PencilIconProps {
  className?: string;
}

export const PencilIcon: React.FC<PencilIconProps> = ({ className }) => {
  return (
    <svg 
      className={cn("h-6 w-6", className)}
      viewBox="0 0 250 250" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M185,121l-56-56,29.66-29.66c3.12-3.12,8.19-3.12,11.31,0l44.69,44.66c3.12,3.12,3.12,8.19,0,11.31l-29.66,29.69Z" 
        fill="#f99eb3" 
        style={{ isolation: 'isolate' }}
      />
      <path 
        d="M85.69,217h-44.69c-4.42,0-8-3.58-8-8v-44.69c0-2.12.84-4.15,2.34-5.65l123.32-123.32c3.12-3.12,8.19-3.12,11.31,0l44.69,44.66c3.12,3.12,3.12,8.19,0,11.31l-123.32,123.35c-1.5,1.5-3.53,2.34-5.65,2.34Z" 
        fill="none" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11"
      />
      <line 
        x1="129" 
        y1="65" 
        x2="185" 
        y2="121" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11"
      />
      <line 
        x1="157" 
        y1="93" 
        x2="61" 
        y2="189" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11"
      />
      <line 
        x1="88.49" 
        y1="216.49" 
        x2="33.51" 
        y2="161.51" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11"
      />
    </svg>
  );
};