
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="ScholarX Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* 
        Creative Design X:
        A sharp, modern split-X design.
        The left stroke is solid and geometric.
        The right stroke is a dynamic swoosh that cuts through.
      */}
      
      {/* Left Stroke (Solid Chevron) */}
      <path 
        d="M28 22 L52 50 L28 78 H42 L66 50 L42 22 H28 Z" 
        fill="currentColor" 
      />
      
      {/* Right Stroke (Dynamic Swoosh) */}
      <path 
        d="M72 22 L48 50 L72 78 H58 L34 50 L58 22 H72 Z" 
        fill="url(#logoGradient)"
      />
      
      {/* Accent Cut (Optional Detail for 'Slides Exchange' effect) */}
      <path 
        d="M66 50 L72 42 V58 L66 50 Z" 
        fill="currentColor"
        className="opacity-50"
      />
    </svg>
  );
};
