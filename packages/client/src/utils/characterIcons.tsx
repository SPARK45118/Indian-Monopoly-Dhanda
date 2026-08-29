import React from 'react';

export const CharacterIcon: React.FC<{ id: string; className?: string }> = ({ id, className = "w-12 h-12" }) => {
  switch (id) {
    case 'trader':
      // The Trader (Vyapari) - Gold & Crimson Scales of Trade / Luxury Briefcase
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="traderBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b45309" />
              <stop offset="50%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#78350f" />
            </linearGradient>
            <linearGradient id="goldCoin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="100%" stop-color="#d97706" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#1c1917" stroke="#f59e0b" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#traderBg)" opacity="0.15"/>
          
          {/* Scales of Trade & Wealth */}
          <path d="M50 20v55M30 30h40" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <circle cx="50" cy="20" r="4" fill="#fef08a"/>
          
          {/* Left Pan */}
          <path d="M30 30l-12 22h24z" fill="#f59e0b" opacity="0.8"/>
          <circle cx="30" cy="46" r="6" fill="url(#goldCoin)"/>
          
          {/* Right Pan */}
          <path d="M70 30l-12 26h24z" fill="#f59e0b" opacity="0.8"/>
          <circle cx="70" cy="50" r="6" fill="url(#goldCoin)"/>
          
          {/* Base Coins Stack */}
          <rect x="36" y="72" width="28" height="8" rx="4" fill="#d97706"/>
          <rect x="40" y="66" width="20" height="6" rx="3" fill="#fef08a"/>
        </svg>
      );

    case 'food-king':
      // The Food King (Bhojan Samrat) - Royal Gourmet Cloche Crown with Flame
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="foodBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#dc2626" />
              <stop offset="50%" stop-color="#f97316" />
              <stop offset="100%" stop-color="#991b1b" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#1c1917" stroke="#ef4444" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#foodBg)" opacity="0.15"/>
          
          {/* Royal Crown Handle */}
          <path d="M42 22l8-6 8 6-3 8h-10z" fill="#facc15"/>
          <circle cx="50" cy="14" r="3" fill="#ef4444"/>

          {/* Cloche Dome */}
          <path d="M22 62c0-18 12.5-32 28-32s28 14 28 32z" fill="url(#foodBg)"/>
          
          {/* Platter Base */}
          <rect x="16" y="62" width="68" height="7" rx="3.5" fill="#facc15"/>
          <rect x="26" y="69" width="48" height="6" rx="3" fill="#e2e8f0"/>
          
          {/* Spice Aroma Stars */}
          <path d="M36 28q-4-6 0-10" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M64 28q4-6 0-10" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      );

    case 'tech-founder':
      // The Tech Founder (Startup Guru) - Cyber Hexagon, Rocket & Chip
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="techBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563eb" />
              <stop offset="50%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#0f172a" stroke="#3b82f6" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#techBg)" opacity="0.15"/>
          
          {/* Circuit Hexagon */}
          <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.6"/>
          
          {/* Startup Rocket */}
          <path d="M50 24c8 8 12 24 12 32l-12-6-12 6c0-8 4-24 12-32z" fill="url(#techBg)"/>
          <circle cx="50" cy="40" r="5" fill="#ffffff"/>
          <path d="M38 56l-8 8v4l8-4z" fill="#38bdf8"/>
          <path d="M62 56l8 8v4l-8-4z" fill="#38bdf8"/>
          
          {/* Rocket Thruster Flame */}
          <polygon points="46,54 50,74 54,54" fill="#f59e0b"/>
          <polygon points="48,54 50,66 52,54" fill="#ffffff"/>
        </svg>
      );

    case 'builder':
      // The Builder (Nirmata) - Skyscraper Architecture & Construction Crane
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="builderBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#9333ea" />
              <stop offset="50%" stop-color="#a855f7" />
              <stop offset="100%" stop-color="#581c87" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#18181b" stroke="#a855f7" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#builderBg)" opacity="0.15"/>
          
          {/* Tower 1 */}
          <rect x="22" y="44" width="18" height="34" rx="2" fill="#71717a"/>
          <rect x="26" y="48" width="4" height="6" fill="#facc15"/>
          <rect x="32" y="48" width="4" height="6" fill="#facc15"/>
          <rect x="26" y="58" width="4" height="6" fill="#facc15"/>
          <rect x="32" y="58" width="4" height="6" fill="#facc15"/>

          {/* Center Main Skyscraper */}
          <rect x="44" y="26" width="22" height="52" rx="3" fill="url(#builderBg)"/>
          <polygon points="55,16 46,26 64,26" fill="#c084fc"/>
          <line x1="55" y1="12" x2="55" y2="16" stroke="#facc15" stroke-width="2"/>
          
          {/* Windows */}
          <rect x="49" y="32" width="4" height="5" fill="#ffffff" opacity="0.9"/>
          <rect x="57" y="32" width="4" height="5" fill="#ffffff" opacity="0.9"/>
          <rect x="49" y="42" width="4" height="5" fill="#ffffff" opacity="0.9"/>
          <rect x="57" y="42" width="4" height="5" fill="#ffffff" opacity="0.9"/>
          <rect x="49" y="52" width="4" height="5" fill="#ffffff" opacity="0.9"/>
          <rect x="57" y="52" width="4" height="5" fill="#ffffff" opacity="0.9"/>

          {/* Crane Boom */}
          <path d="M70 78V36l16-6" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
          <line x1="86" y1="30" x2="86" y2="44" stroke="#f59e0b" stroke-width="1.5"/>
          <rect x="83" y="44" width="6" height="6" fill="#ef4444"/>
        </svg>
      );

    case 'influencer':
      // The Influencer (Content Creator) - Studio Camera, Neon Star & Play Button
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="influencerBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ec4899" />
              <stop offset="50%" stop-color="#f43f5e" />
              <stop offset="100%" stop-color="#9d174d" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#18181b" stroke="#ec4899" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#influencerBg)" opacity="0.15"/>
          
          {/* Cinema Clapper / Camera Body */}
          <rect x="22" y="32" width="42" height="38" rx="8" fill="url(#influencerBg)"/>
          <circle cx="43" cy="51" r="11" fill="#18181b" stroke="#ffffff" stroke-width="2.5"/>
          
          {/* Flash & Lens */}
          <polygon points="64,42 80,32 80,68 64,58" fill="#ec4899"/>
          <circle cx="30" cy="40" r="3" fill="#facc15"/>
          
          {/* Viral Play Triangle */}
          <polygon points="40,46 48,51 40,56" fill="#f43f5e"/>

          {/* Sparkles / Notification Star */}
          <path d="M74 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#facc15"/>
        </svg>
      );

    case 'sports-star':
      // The Sports Star (Cricket Hero) - Golden Trophy & Crossed Cricket Bats
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sportsBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="50%" stop-color="#059669" />
              <stop offset="100%" stop-color="#064e3b" />
            </linearGradient>
            <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="100%" stop-color="#ca8a04" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="38" fill="url(#sportsBg)" opacity="0.2"/>
          
          {/* Crossed Bats */}
          <line x1="24" y1="24" x2="76" y2="76" stroke="#ca8a04" stroke-width="5" stroke-linecap="round"/>
          <line x1="76" y1="24" x2="24" y2="76" stroke="#ca8a04" stroke-width="5" stroke-linecap="round"/>
          
          {/* Championship Trophy Cup */}
          <path d="M34 30h32v18c0 10-7 16-16 16s-16-6-16-16z" fill="url(#trophyGold)" stroke="#fef08a" stroke-width="1.5"/>
          <path d="M34 36h-8c0 8 4 12 8 12M66 36h8c0 8-4 12-8 12" stroke="#fef08a" stroke-width="3" fill="none"/>
          
          {/* Trophy Stand */}
          <rect x="46" y="64" width="8" height="8" fill="#ca8a04"/>
          <rect x="38" y="72" width="24" height="6" rx="2" fill="#fef08a"/>
          
          {/* Red Cricket Ball */}
          <circle cx="50" cy="42" r="5" fill="#dc2626"/>
          <path d="M47 39q3 3 6 0" stroke="#ffffff" stroke-width="1" fill="none"/>
        </svg>
      );

    default:
      return (
        <div className={`${className} rounded-2xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-white`}>
          🎲
        </div>
      );
  }
};
