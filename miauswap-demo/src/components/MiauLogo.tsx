'use client';

import React from 'react';

interface MiauLogoProps {
  size?: number;
  className?: string;
}

export default function MiauLogo({ size = 36, className = '' }: MiauLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="miauBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F06292' }} />
          <stop offset="100%" style={{ stopColor: '#E91E73' }} />
        </linearGradient>
        <linearGradient id="miauM" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFFFFF' }} />
          <stop offset="100%" style={{ stopColor: '#FFD0E0' }} />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="184" height="184" rx="48" ry="48" fill="url(#miauBg)" />
      <g transform="translate(100,100)" fill="url(#miauM)">
        <polygon points="-42,-52 -32,-68 -22,-52" />
        <polygon points="22,-52 32,-68 42,-52" />
        <path
          d="M-45,-45 L-45,45 L-30,45 L-30,-15 Q-30,-35 -10,-35 Q5,-35 5,-15 L5,45 L20,45 L20,-15 Q20,-35 38,-35 Q50,-35 50,-15 L50,45 L65,45 L65,-20 Q65,-50 38,-50 Q20,-50 12,-38 Q5,-50 -12,-50 Q-30,-50 -37,-38 L-45,-50 Z"
          transform="translate(-10,5) scale(0.85)"
        />
        <rect x="-55" y="-8" width="20" height="4" rx="2" />
        <rect x="-55" y="4" width="20" height="4" rx="2" />
        <rect x="45" y="-8" width="20" height="4" rx="2" />
        <rect x="45" y="4" width="20" height="4" rx="2" />
      </g>
    </svg>
  );
}
