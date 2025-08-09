import React from 'react';
import { cn } from '@/lib/utils';

interface BrainIconProps {
  className?: string;
}

export const BrainIcon: React.FC<BrainIconProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 250 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M205,79.73v-6.73c0-22.09-17.91-40-40-40s-40,17.91-40,40c0-22.09-17.91-40-40-40s-40,17.91-40,40v6.73c-25,8.81-38.13,36.23-29.31,61.23,4.83,13.7,15.61,24.48,29.31,29.31h0v6.73c0,22.09,17.91,40,40,40s40-17.91,40-40c0,22.09,17.91,40,40,40s40-17.91,40-40v-6.73h0c25-8.81,38.13-36.23,29.31-61.23-4.83-13.7-15.61-24.48-29.31-29.31Z"
        fill="#f99eb3"
        stroke="currentColor"
        strokeMiterlimit="10"
      />
      <path
        d="M85,137c22.09,0,40,17.91,40,40s-17.91,40-40,40-40-17.91-40-40v-6.73"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <path
        d="M165,137c-22.09,0-40,17.91-40,40s17.91,40,40,40,40-17.91,40-40v-6.73"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <path
        d="M69,173h-8c-26.51.02-48.02-21.45-48.04-47.96-.02-20.37,12.83-38.54,32.04-45.31v-6.73c0-22.09,17.91-40,40-40s40,17.91,40,40v104"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <path
        d="M181,173h8c26.51.02,48.02-21.45,48.04-47.96.02-20.37-12.83-38.54-32.04-45.31v-6.73c0-22.09-17.91-40-40-40s-40,17.91-40,40"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <path
        d="M197,113h-4c-15.46,0-28-12.54-28-28v-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
      <path
        d="M53,113h4c15.46,0,28-12.54,28-28v-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="11"
      />
    </svg>
  );
};