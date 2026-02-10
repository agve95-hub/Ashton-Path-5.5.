import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = (props) => {
  const { children, className = '', onClick } = props;
  return (
    <div 
      onClick={onClick}
      className={`bg-midnight-800 rounded-2xl shadow-card hover:shadow-soft transition-all duration-300 border border-white/5 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = (props) => {
  const { children, className = '' } = props;
  return (
    <div className={`px-8 py-6 border-b border-white/5 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = (props) => {
  const { children, className = '' } = props;
  return (
    <div className={`p-8 ${className}`}>
      {children}
    </div>
  );
};