import React from 'react';

type IconName = 'alert' | 'bolt' | 'check' | 'x' | 'info' | 'star' | 'arrowRight' | 'external' | 'settings' | 'swap' | 'lock' | 'sparkle';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  'aria-hidden'?: boolean;
}

const paths: Record<IconName, React.ReactNode> = {
  alert: <path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01" />,
  bolt: <path d="m13 2-9 13h7l-1 7 9-13h-7l1-7Z" />,
  check: <path d="m4 12 5 5L20 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  info: <path d="M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  external: <path d="M14 4h6v6m0-6L10 14m10 0v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />,
  settings: <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm0-13v3m0 13v3m8.2-11.8-2.6 1.5m-11.2 6.5-2.6 1.5m16.4 0-2.6-1.5M6.4 6.3 3.8 4.8" />,
  swap: <path d="M7 7h13m-4-4 4 4-4 4M17 17H4m4 4-4-4 4-4" />,
  lock: <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Z" />,
  sparkle: <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />,
};

export function Icon({ name, className, size = 16, 'aria-hidden': ariaHidden = true }: IconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
