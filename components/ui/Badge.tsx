import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = (props) => {
  const { children, variant = 'default', className = '' } = props;
  const variants = {
    default: "bg-midnight-950 text-slate-400 border-slate-800",
    success: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    outline: "bg-transparent text-slate-500 border-slate-700"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};