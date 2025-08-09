import React from 'react';

interface AtomIconProps {
  className?: string;
}

export const AtomIcon: React.FC<AtomIconProps> = ({ className = "h-4 w-4" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 250 250" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Atom"
    >
      <ellipse 
        fill="#f99eb3" 
        cx="125" 
        cy="125" 
        rx="44.13" 
        ry="116.33" 
        transform="translate(-51.78 125) rotate(-45)"
      />
      <ellipse 
        fill="none" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11" 
        cx="125" 
        cy="125" 
        rx="44.13" 
        ry="116.33" 
        transform="translate(-51.78 125) rotate(-45)"
      />
      <ellipse 
        fill="none" 
        stroke="#1a40f4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="11" 
        cx="125" 
        cy="125" 
        rx="116.33" 
        ry="44.13" 
        transform="translate(-51.78 125) rotate(-45)"
      />
      <circle 
        fill="#1a40f4" 
        cx="125" 
        cy="125" 
        r="12"
      />
    </svg>
  );
};