import React from 'react';
import logoImg from '../../assets/setsuzoku-logo.png';

export interface LogoProps {
  variant?: 'full' | 'mark' | 'sidebar' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = false,
}) => {
  // Height / scale classes
  const sizeMap = {
    xs: { h: 'h-6', mark: 'w-6 h-6', text: 'text-xs', sub: 'text-[9px]' },
    sm: { h: 'h-8', mark: 'w-8 h-8', text: 'text-sm', sub: 'text-[10px]' },
    md: { h: 'h-11', mark: 'w-10 h-10', text: 'text-base', sub: 'text-xs' },
    lg: { h: 'h-14', mark: 'w-14 h-14', text: 'text-lg', sub: 'text-xs' },
    xl: { h: 'h-20', mark: 'w-20 h-20', text: 'text-xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'mark') {
    // Compact mark: Focused on the two high-fiving figures
    return (
      <div
        className={`relative rounded-lg overflow-hidden bg-white border border-slate-200/80 shadow-sm flex items-center justify-center flex-shrink-0 ${currentSize.mark} ${className}`}
        title="SETSUZOKU"
      >
        <img
          src={logoImg}
          alt="SETSUZOKU Mark"
          className="w-[170%] h-[170%] max-w-none object-cover object-[center_24%]"
        />
      </div>
    );
  }

  if (variant === 'sidebar') {
    // Tailored for dark enterprise sidebars (#0F212D / #142B3A)
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700/60 shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img
            src={logoImg}
            alt="SETSUZOKU"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white font-sans">
              SETSUZOKU
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-brand-teal/20 text-brand-teal rounded border border-brand-teal/30">
              OS
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
            CONNECT &bull; CREATE &bull; GROW
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    // Full authentic badge on clean white rounded card
    return (
      <div
        className={`inline-flex items-center gap-3 bg-white border border-slate-200/90 rounded-xl p-2 shadow-sm ${className}`}
      >
        <img
          src={logoImg}
          alt="SETSUZOKU"
          className={`${currentSize.h} w-auto object-contain`}
        />
        {showSubtitle && (
          <div className="border-l border-slate-200 pl-3">
            <span className={`font-bold text-brand-navy block ${currentSize.text}`}>
              SETSUZOKU
            </span>
            <span className={`text-brand-teal font-semibold tracking-wider uppercase block ${currentSize.sub}`}>
              Enterprise Platform
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default: Pure image display with natural aspect ratio & transparent blending
  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <img
        src={logoImg}
        alt="SETSUZOKU — CONNECT • CREATE • GROW"
        className={`${currentSize.h} w-auto object-contain mix-blend-multiply`}
      />
      {showSubtitle && (
        <span className="text-[10px] text-brand-muted tracking-widest font-semibold uppercase mt-1">
          CONNECT &bull; CREATE &bull; GROW
        </span>
      )}
    </div>
  );
};

