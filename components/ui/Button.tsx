import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    className = '', 
    disabled,
    ...rest 
  } = props;

  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98]";
  
  const variants = {
    // Primary: Deep midnight blue background, Teal text, Subtle border (Matches Sign In reference)
    primary: "bg-midnight-800 text-teal-400 border border-slate-700/50 shadow-lg shadow-black/20 hover:bg-slate-800 hover:border-teal-500/30 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:text-teal-300 backdrop-blur-sm",
    
    // Solid: High emphasis, filled brand color
    solid: "bg-teal-500 text-midnight-950 border border-teal-400 hover:bg-teal-400 hover:border-teal-300 shadow-lg shadow-teal-500/20 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]",

    // Secondary: Transparent with border, more subtle
    secondary: "bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-700",
    
    // Outline: Similar to secondary but focused on border
    outline: "bg-transparent text-slate-500 border border-slate-800 hover:border-slate-600 hover:text-slate-300",
    
    // Ghost: No border, just hover effect
    ghost: "bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-teal-400",
    
    // Danger: Red tints
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-2",
    md: "px-6 py-3.5 text-sm gap-2.5",
    lg: "px-8 py-4 text-base gap-3"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};