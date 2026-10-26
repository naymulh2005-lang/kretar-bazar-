import React from 'react';
import logoImg from '../assets/images/master_logo_kb_1787752512425.jpg';
import { useShop } from '../context/ShopContext';

interface MasterLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'horizontal' | 'light';
  showSubtext?: boolean;
}

export const MasterLogo: React.FC<MasterLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtext = true
}) => {
  let customLogoUrl = '';
  try {
    const shop = useShop();
    customLogoUrl = shop.storeBranding?.logoUrl || '';
  } catch {
    // If rendered outside ShopProvider
  }
  const displayLogo = (customLogoUrl && customLogoUrl.trim()) || logoImg;

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleek, thin rounded emblem with clear crisp logo */}
      <div className={`relative flex-shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-500 shadow-sm transition-transform duration-200 hover:scale-105 ${sizeMap[size]}`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border border-amber-200/60 shadow-inner">
          <img
            src={displayLogo || logoImg}
            alt="Kretar Bazar — Kids & Baby Master Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* Brand Text for Horizontal Layout */}
      {(variant === 'full' || variant === 'horizontal') && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-extrabold tracking-tight text-blue-950 font-serif ${textSizeMap[size]}`}>
              ক্রেতার <span className="text-amber-600 font-bold">বাজার</span>
            </span>
          </div>
          {showSubtext && (
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-amber-700 mt-0.5">
              Kids & Baby
            </span>
          )}
        </div>
      )}
    </div>
  );
};
