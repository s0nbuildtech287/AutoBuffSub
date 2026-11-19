'use client';

import React from 'react';

interface PlatformIconProps {
  id: string; // 'facebook' | 'tiktok' | 'instagram' | 'youtube' | 'telegram' | 'shopee' | 'twitter' | 'threads'
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PLATFORM_BRAND_STYLES: Record<string, {
  name: string;
  bgGradient: string;
  badgeText: string;
  primaryColor: string;
}> = {
  facebook: {
    name: 'Facebook',
    bgGradient: 'bg-gradient-to-tr from-blue-700 to-blue-500',
    badgeText: 'Mạng Xã Hội',
    primaryColor: '#1877F2',
  },
  tiktok: {
    name: 'TikTok',
    bgGradient: 'bg-gradient-to-tr from-neutral-950 via-zinc-900 to-black',
    badgeText: 'Video Ngắn',
    primaryColor: '#EE1D52',
  },
  instagram: {
    name: 'Instagram',
    bgGradient: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    badgeText: 'Hình Ảnh & Reels',
    primaryColor: '#E1306C',
  },
  youtube: {
    name: 'YouTube',
    bgGradient: 'bg-gradient-to-tr from-red-700 to-red-500',
    badgeText: 'Video & Kênh',
    primaryColor: '#FF0000',
  },
  telegram: {
    name: 'Telegram',
    bgGradient: 'bg-gradient-to-tr from-sky-600 to-cyan-400',
    badgeText: 'Nhóm & Kênh',
    primaryColor: '#24A1DE',
  },
  shopee: {
    name: 'Shopee',
    bgGradient: 'bg-gradient-to-tr from-orange-600 to-amber-500',
    badgeText: 'Thương Mại ĐT',
    primaryColor: '#EE4D2D',
  },
  twitter: {
    name: 'X / Twitter',
    bgGradient: 'bg-gradient-to-tr from-neutral-900 via-zinc-800 to-black',
    badgeText: 'Tin Tức & Follow',
    primaryColor: '#000000',
  },
  threads: {
    name: 'Threads',
    bgGradient: 'bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-800',
    badgeText: 'Cộng Đồng',
    primaryColor: '#101010',
  },
};

export const PlatformIcon: React.FC<PlatformIconProps> = ({ id, size = 'md', className = '' }) => {
  const normalizedId = id.toLowerCase();
  
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const iconClass = `${sizeMap[size]} text-white shrink-0 ${className}`;

  switch (normalizedId) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case 'shopee':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M19.467 6.402A2.83 2.83 0 0 0 16.924 5H15.5V3.917C15.5 1.757 13.933 0 12 0s-3.5 1.757-3.5 3.917V5H7.076a2.83 2.83 0 0 0-2.543 1.402L2.09 11.59a1.65 1.65 0 0 0-.09.544V20.5C2 22.43 3.57 24 5.5 24h13c1.93 0 3.5-1.57 3.5-3.5v-8.366c0-.188-.032-.373-.09-.544l-2.443-5.188zM10 3.917C10 2.86 10.897 2 12 2s2 .86 2 1.917V5h-4V3.917zm7.5 14.583a.75.75 0 0 1-.75.75h-9.5a.75.75 0 0 1 0-1.5h9.5a.75.75 0 0 1 .75.75z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'threads':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M12.004 0C5.373 0 0 5.373 0 12.004S5.373 24 12.004 24c6.262 0 11.411-4.793 11.956-10.902h-2.535c-.524 4.743-4.526 8.402-9.421 8.402-5.247 0-9.5-4.253-9.5-9.5s4.253-9.5 9.5-9.5c5.074 0 9.208 3.938 9.476 8.948.01.21.016.425.016.643 0 3.238-1.853 5.409-4.721 5.409-1.577 0-2.887-.788-3.411-2.053l-.066-.192c-.58.983-1.638 1.645-2.898 1.645-2.222 0-3.924-1.745-3.924-4.008 0-2.28 1.737-4.041 3.987-4.041 1.341 0 2.456.634 3.056 1.613l.035.065V8.163h2.383v6.398c0 1.951.986 3.09 2.543 3.09 1.686 0 2.766-1.394 2.766-3.45 0-.174-.005-.347-.014-.519C19.14 7.625 15.932 4.1 12.004 4.1zm-.095 8.455c-1.127 0-1.954.846-1.954 1.979s.827 1.98 1.954 1.98c1.12 0 1.954-.847 1.954-1.98 0-1.133-.834-1.979-1.954-1.979z" />
        </svg>
      );
    default:
      return (
        <span className="font-black text-xs uppercase">{id.slice(0, 2)}</span>
      );
  }
};

