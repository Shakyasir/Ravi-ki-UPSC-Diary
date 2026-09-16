import React, { useRef } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { store } from '../lib/storage';

interface RaviAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  allowUpload?: boolean;
  showBadge?: boolean;
}

export const RaviAvatar: React.FC<RaviAvatarProps> = ({
  size = 'md',
  className = '',
  allowUpload = false,
  showBadge = false,
}) => {
  const profile = store.getProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
    hero: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 text-2xl',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          store.updateProfile({ profilePhoto: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative inline-block select-none group ${className}`} id="ravi-avatar-container">
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-md ring-2 ring-indigo-500/20 bg-slate-900 relative transition-transform duration-300 group-hover:scale-[1.02] flex items-center justify-center`}
      >
        {profile.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt="IAS Ravi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          /* High-Fidelity SVG Portrait matching Ravi's Pixar Aesthetic */
          <div className="w-full h-full relative bg-gradient-to-b from-slate-100 via-indigo-50/50 to-amber-50/30 flex flex-col items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft Warm Studio Backdrop */}
              <rect width="200" height="200" fill="#F8FAFC" />
              <circle cx="100" cy="85" r="75" fill="#EEF2FF" />
              <circle cx="150" cy="50" r="40" fill="#FEF3C7" fillOpacity="0.4" />

              {/* Study Desk Books in background */}
              <rect x="18" y="145" width="40" height="10" rx="2" fill="#1E3A8A" />
              <text x="22" y="152" fill="#FFFFFF" fontSize="5" fontWeight="bold" fontFamily="sans-serif">UPSC</text>
              <rect x="15" y="157" width="44" height="12" rx="2" fill="#831843" />
              <text x="18" y="165" fill="#FFFFFF" fontSize="5" fontWeight="bold" fontFamily="sans-serif">NCERT</text>
              <rect x="12" y="171" width="48" height="14" rx="2" fill="#14532D" />
              <text x="15" y="180" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">HISTORY</text>

              {/* Pen Cup with Motivational Quote */}
              <rect x="155" y="148" width="28" height="36" rx="3" fill="#0F172A" />
              <line x1="162" y1="130" x2="162" y2="148" stroke="#EAB308" strokeWidth="3" strokeLinecap="round" />
              <line x1="168" y1="126" x2="168" y2="148" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
              <line x1="174" y1="132" x2="174" y2="148" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <text x="158" y="160" fill="#E2E8F0" fontSize="3.5" fontWeight="bold">DREAM</text>
              <text x="158" y="166" fill="#E2E8F0" fontSize="3.5" fontWeight="bold">ACHIEVE</text>

              {/* Ravi Body: Tailored Navy Suit Blazer */}
              <path
                d="M48 200 C48 155 70 142 100 142 C130 142 152 155 152 200 Z"
                fill="#1E293B"
              />
              {/* White Shirt Collar */}
              <polygon points="100,142 86,160 114,160" fill="#FFFFFF" />
              <polygon points="100,142 82,154 92,168 100,158" fill="#F8FAFC" />
              <polygon points="100,142 118,154 108,168 100,158" fill="#E2E8F0" />
              {/* Navy Necktie */}
              <polygon points="97,156 103,156 105,188 100,195 95,188" fill="#0F172A" />
              {/* Suit Lapels */}
              <path d="M72 165 L88 195 L65 200 Z" fill="#0F172A" />
              <path d="M128 165 L112 195 L135 200 Z" fill="#0F172A" />

              {/* Neck */}
              <rect x="91" y="118" width="18" height="26" rx="6" fill="#F6C39B" />

              {/* Head / Face */}
              <ellipse cx="100" cy="94" rx="34" ry="38" fill="#F6C39B" />

              {/* Hair (Neat, Pixar-Style Parted Dark Hair) */}
              <path
                d="M66 84 C64 58 78 42 100 42 C124 42 136 56 134 84 C134 76 128 62 116 58 C102 54 84 58 74 72 C70 78 68 82 66 84 Z"
                fill="#1E1E24"
              />
              <path
                d="M72 70 C85 52 118 50 134 64 C124 60 106 60 94 66 C84 72 78 78 72 70 Z"
                fill="#2D2D38"
              />

              {/* Ears */}
              <ellipse cx="66" cy="95" rx="5" ry="9" fill="#F0B589" />
              <ellipse cx="134" cy="95" rx="5" ry="9" fill="#F0B589" />

              {/* Red Tilak on Forehead */}
              <ellipse cx="100" cy="74" rx="2.5" ry="4.5" fill="#DC2626" />
              <circle cx="100" cy="71" r="1.5" fill="#FEE2E2" />

              {/* Eyebrows */}
              <path d="M78 82 Q86 79 94 82" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M106 82 Q114 79 122 82" stroke="#1E1E24" strokeWidth="2.5" strokeLinecap="round" />

              {/* Round Eyeglasses Frames (Thin Modern Gold / Dark Amber) */}
              <circle cx="85" cy="94" r="12.5" stroke="#475569" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.15" />
              <circle cx="115" cy="94" r="12.5" stroke="#475569" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.15" />
              {/* Glasses Bridge */}
              <path d="M97.5 93 Q100 91 102.5 93" stroke="#475569" strokeWidth="2" fill="none" />
              {/* Glasses Temple arms */}
              <line x1="72.5" y1="92" x2="66" y2="92" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <line x1="127.5" y1="92" x2="134" y2="92" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

              {/* Eyes (Pixar expressive warm eyes) */}
              <circle cx="85" cy="94" r="4.5" fill="#3B2618" />
              <circle cx="115" cy="94" r="4.5" fill="#3B2618" />
              <circle cx="83.5" cy="92.5" r="1.5" fill="#FFFFFF" />
              <circle cx="113.5" cy="92.5" r="1.5" fill="#FFFFFF" />

              {/* Nose */}
              <path d="M98 97 Q100 102 102 102" stroke="#E09F75" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Warm Confident Smile */}
              <path d="M90 111 Q100 118 110 111" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Study Desk Hand with Fountain Pen resting on cheek */}
              <ellipse cx="78" cy="132" rx="7" ry="10" fill="#F6C39B" />
              <path d="M72 136 L86 160" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Upload Overlay Button when enabled */}
        {allowUpload && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            title="Upload Ravi's Official Portrait Photo"
          >
            <Camera className="w-6 h-6 mb-1 drop-shadow" />
            <span className="text-[10px] font-semibold tracking-wide drop-shadow">Change Photo</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {showBadge && (
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full p-1 shadow-md border-2 border-white" title="IAS Aspirant">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
