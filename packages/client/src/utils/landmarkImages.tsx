import React from 'react';

// Landmark Image Asset mapping (for tiles that have custom png assets)
const LANDMARK_IMAGE_MAP: Record<number, string> = {
  // These map to any custom images in /public/landmarks/
  // Add as needed when landmark assets are available
};

// Landmark Graphic renderer component for each of the 40 board tiles
export const LandmarkGraphic: React.FC<{ tileId: number; className?: string }> = ({ tileId, className = "w-full h-full" }) => {
  const customImg = LANDMARK_IMAGE_MAP[tileId];

  if (customImg) {
    return (
      <img
        src={customImg}
        alt="Landmark"
        className={`${className} object-cover w-full h-full filter brightness-90 hover:brightness-105 transition-all`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  switch (tileId) {
    case 0: // START
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="60" fill="#0D1321" />
          <path d="M50 12 L70 30 L50 48 L30 30 Z" fill="#D9A441" opacity="0.2" />
          <text x="50" y="28" textAnchor="middle" fill="#F5C75A" fontSize="22" fontWeight="900" fontFamily="serif">GO</text>
          <path d="M25 42 H75 M55 37 L75 42 L55 47" stroke="#F5C75A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 1: // Gateway of India - Mumbai
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a0f0f" />
          <path d="M35 50 V25 L50 12 L65 25 V50 Z" fill="#2a1a1a" stroke="#D9A441" strokeWidth="1" />
          <path d="M42 50 V30 H58 V50" fill="#1a0a0a" />
          <path d="M35 25 L50 12 L65 25" stroke="#D9A441" strokeWidth="1.5" />
          <rect x="44" y="32" width="12" height="16" fill="#0D1321" />
        </svg>
      );

    case 2: // Sabarmati Ashram - Ahmedabad
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1810" />
          <path d="M25 50 V22 L50 10 L75 22 V50 Z" fill="#2a2410" stroke="#D9A441" strokeWidth="1" />
          <path d="M35 50 V28 H65 V50" fill="#1a1608" />
          <circle cx="50" cy="20" r="5" fill="#D9A441" opacity="0.4" />
        </svg>
      );

    case 3: // Hawa Mahal - Jaipur
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#2a1018" />
          <path d="M30 50 V15 H70 V50 Z" fill="#3a1828" stroke="#db2777" strokeWidth="1" />
          <rect x="34" y="20" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="46" y="20" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="58" y="20" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="34" y="30" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="46" y="30" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="58" y="30" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="34" y="40" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="46" y="40" width="8" height="6" rx="2" fill="#1a0a10" />
          <rect x="58" y="40" width="8" height="6" rx="2" fill="#1a0a10" />
          <path d="M30 15 L50 5 L70 15" stroke="#D9A441" strokeWidth="1.5" />
        </svg>
      );

    case 4: // India Gate - Delhi
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1410" />
          <path d="M30 50 V18 H70 V50 Z" fill="#2a2010" stroke="#D9A441" strokeWidth="1" />
          <rect x="42" y="28" width="16" height="22" fill="#0D1321" rx="8" />
          <path d="M30 18 H70" stroke="#D9A441" strokeWidth="2" />
          <rect x="45" y="12" width="10" height="6" fill="#D9A441" opacity="0.5" />
        </svg>
      );

    case 5: // Taj Mahal - Agra
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1818" />
          <path d="M50 8 Q35 22 35 50 H65 Q65 22 50 8 Z" fill="#e8e0d0" opacity="0.15" />
          <path d="M45 8 L50 2 L55 8" fill="#D9A441" opacity="0.5" />
          <path d="M35 50 V35 H40 V50 M60 50 V35 H65 V50" stroke="#D9A441" strokeWidth="1" />
          <path d="M20 50 V40 L22 35 M80 50 V40 L78 35" stroke="#D9A441" strokeWidth="1" />
        </svg>
      );

    case 6: // Golden Temple - Amritsar
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1508" />
          <path d="M30 50 V22 Q50 10 70 22 V50 Z" fill="#2a2008" stroke="#D9A441" strokeWidth="1.5" />
          <path d="M30 22 Q50 10 70 22" fill="#D9A441" opacity="0.3" />
          <path d="M20 52 H80" stroke="#3498db" strokeWidth="3" opacity="0.3" />
        </svg>
      );

    case 7: // Howrah Bridge - Kolkata
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#0f1a20" />
          <path d="M10 45 Q30 15 50 30 Q70 15 90 45" stroke="#0891b2" strokeWidth="2.5" fill="none" />
          <path d="M10 45 V50 M90 45 V50" stroke="#0891b2" strokeWidth="3" />
          <path d="M10 50 H90" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 8: // Kapaleeshwarar Temple - Chennai
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1510" />
          <path d="M40 50 V15 L50 5 L60 15 V50 Z" fill="#2a2010" stroke="#D9A441" strokeWidth="1" />
          <path d="M35 50 V25 H65 V50" fill="#1a1008" />
          <path d="M40 15 L50 5 L60 15" fill="#D9A441" opacity="0.4" />
        </svg>
      );

    case 9: // Chance
    case 19:
    case 25:
    case 37:
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#2d1a2e" />
          <text x="50" y="40" textAnchor="middle" fill="#db2777" fontSize="32" fontWeight="900" fontFamily="serif">?</text>
        </svg>
      );

    case 10: // Chai Break
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1510" />
          <path d="M35 22 L40 50 H60 L65 22 Z" fill="#9c5421" stroke="#D9A441" strokeWidth="1.5" />
          <ellipse cx="50" cy="22" rx="15" ry="4" fill="#69330e" />
          <path d="M42 16 Q45 10 42 4 M50 16 Q53 10 50 4 M58 16 Q61 10 58 4" stroke="#F5C75A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 16: // Luck
    case 32:
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#112415" />
          <circle cx="42" cy="24" r="8" fill="#2ecc71" />
          <circle cx="58" cy="24" r="8" fill="#2ecc71" />
          <circle cx="42" cy="36" r="8" fill="#2ecc71" />
          <circle cx="58" cy="36" r="8" fill="#2ecc71" />
          <path d="M50 35 V50" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 20: // Free Parking
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1510" />
          <path d="M25 42 H75 V48 H25 Z" fill="#475569" />
          <path d="M32 42 V28 L42 22 H58 L68 28 V42" fill="#e74c3c" stroke="#D9A441" strokeWidth="1" />
          <circle cx="36" cy="45" r="4" fill="#1e293b" />
          <circle cx="64" cy="45" r="4" fill="#1e293b" />
        </svg>
      );

    case 22: // Community Chest
    case 28:
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1a10" />
          <rect x="30" y="24" width="40" height="28" fill="#8B6914" rx="2" stroke="#D9A441" strokeWidth="1.5" />
          <path d="M25 24 H75 V28 H25 Z" fill="#D9A441" />
          <rect x="46" y="24" width="8" height="28" fill="#D9A441" opacity="0.3" />
        </svg>
      );

    case 30: // Jail
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1c1c1c" />
          <path d="M15 10 H85 V50 H15 Z" fill="#2a2a2a" stroke="#888" strokeWidth="2" />
          <line x1="30" y1="10" x2="30" y2="50" stroke="#D9A441" strokeWidth="3" />
          <line x1="45" y1="10" x2="45" y2="50" stroke="#D9A441" strokeWidth="3" />
          <line x1="60" y1="10" x2="60" y2="50" stroke="#D9A441" strokeWidth="3" />
          <line x1="75" y1="10" x2="75" y2="50" stroke="#D9A441" strokeWidth="3" />
        </svg>
      );

    case 35: // Wealth Tax
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1510" />
          <path d="M35 22 Q50 15 65 22 L75 48 Q50 54 25 48 Z" fill="#b8860b" stroke="#ffd700" strokeWidth="1.5" />
          <text x="50" y="40" textAnchor="middle" fill="#111" fontSize="16" fontWeight="bold">₹</text>
        </svg>
      );

    case 38: // Treasure / Khazana
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#1a1a0a" />
          <rect x="28" y="22" width="44" height="30" fill="#8B6914" rx="3" stroke="#D9A441" strokeWidth="2" />
          <path d="M28 28 H72" stroke="#D9A441" strokeWidth="2" />
          <circle cx="50" cy="38" r="6" fill="#F5C75A" />
          <rect x="48" y="16" width="4" height="12" fill="#D9A441" />
        </svg>
      );

    case 39: // Desi Event
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#241014" />
          <rect x="30" y="24" width="40" height="28" fill="#c0392b" rx="2" stroke="#F5C75A" strokeWidth="1.5" />
          <path d="M25 24 H75 V28 H25 Z" fill="#e74c3c" />
          <rect x="46" y="24" width="8" height="28" fill="#F5C75A" />
          <path d="M40 16 Q50 24 44 24 M60 16 Q50 24 56 24" stroke="#F5C75A" strokeWidth="2.5" fill="none" />
        </svg>
      );

    default:
      // Generic property tile with subtle monument silhouette
      return (
        <svg viewBox="0 0 100 60" className={className} fill="none">
          <rect width="100" height="60" fill="#0D1321" />
          <circle cx="50" cy="30" r="10" fill="#D9A441" opacity="0.15" />
        </svg>
      );
  }
};
