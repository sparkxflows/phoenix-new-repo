import React from 'react';

export const RoseOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`pointer-events-none select-none ${className}`}
  >
    {/* Rose petals line-art */}
    <path d="M100 45 C110 35, 130 40, 135 55 C140 70, 130 85, 115 90 C105 93, 90 90, 85 80 C80 65, 90 45, 100 45 Z" />
    <path d="M95 55 C100 50, 115 50, 120 60 C125 70, 115 78, 105 80 C95 82, 90 72, 95 55 Z" />
    <path d="M100 62 C103 60, 110 60, 112 66 C114 72, 108 76, 104 76 Z" />
    <path d="M135 55 C150 60, 160 78, 155 95 C150 110, 135 120, 120 120 C110 120, 105 115, 100 110" />
    <path d="M85 80 C70 85, 55 100, 58 118 C62 135, 80 145, 98 142 C115 140, 130 130, 140 115" />
    <path d="M85 58 C70 65, 62 82, 68 98" />
    <path d="M100 142 C100 170, 96 185, 92 195" />
    {/* Leaves */}
    <path d="M98 155 C80 152, 65 160, 60 172 C75 174, 90 168, 97 160" />
    <path d="M100 168 C120 165, 135 172, 142 182 C125 185, 112 178, 100 172" />
  </svg>
);

export const DragonOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 300 300"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`pointer-events-none select-none ${className}`}
  >
    {/* Stylized oriental dragon line-art */}
    <path d="M150 20 C170 30, 195 45, 190 70 C185 90, 160 100, 140 105 C110 112, 85 130, 85 160 C85 195, 120 215, 155 210 C190 205, 220 180, 230 145 C235 125, 225 105, 205 95" />
    <path d="M190 70 C205 65, 225 70, 235 85 C240 92, 250 88, 260 80 C255 95, 245 102, 235 105" />
    <path d="M210 50 L225 35 M225 60 L245 50" />
    {/* Claws & Scales */}
    <path d="M115 135 C100 135, 90 145, 95 155 C105 152, 115 148, 125 142" />
    <path d="M175 210 C185 225, 195 240, 215 245 C205 235, 195 225, 185 215" />
    <path d="M155 210 C140 230, 125 255, 105 270 C115 255, 130 240, 140 220" />
    {/* Flowing whiskers & clouds */}
    <path d="M235 85 C250 78, 270 82, 280 92" />
    <path d="M225 95 C240 95, 260 105, 270 120" />
  </svg>
);

export const TattooMachineOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`pointer-events-none select-none ${className}`}
  >
    {/* Classic coil/rotary tattoo gun line-art */}
    <rect x="75" y="45" width="22" height="35" rx="3" />
    <rect x="105" y="45" width="22" height="35" rx="3" />
    <line x1="86" y1="45" x2="86" y2="35" />
    <line x1="116" y1="45" x2="116" y2="35" />
    <path d="M60 80 L140 80 L145 95 L55 95 Z" />
    <path d="M90 95 L90 145 L110 145 L110 95" />
    <circle cx="100" cy="120" r="14" />
    <path d="M96 145 L94 185 L106 185 L104 145" />
    <line x1="100" y1="185" x2="100" y2="198" />
    <path d="M55 90 C45 90, 40 70, 50 55 C60 40, 80 40, 85 45" />
  </svg>
);
