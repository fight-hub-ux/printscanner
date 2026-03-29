'use client';

import React from 'react';
import Image from 'next/image';

interface MiauLogoProps {
  size?: number;
  className?: string;
}

export default function MiauLogo({ size = 36, className = '' }: MiauLogoProps) {
  return (
    <Image
      src="/MIAU_Logo2_App_Icon.png"
      alt="MIAU"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
