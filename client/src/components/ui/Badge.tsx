import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'olive' | 'rust' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'muted',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    olive: 'bg-olive/10 text-olive border-olive/20',
    rust: 'bg-rust/10 text-rust border-rust/20',
    muted: 'bg-black/[0.05] text-muted border-black/[0.08]',
  }[variant];

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  }[size];

  return (
    <span
      className={`
        inline-flex items-center font-mono uppercase tracking-wider font-semibold rounded-xs border
        ${variantStyles}
        ${sizeStyles}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
