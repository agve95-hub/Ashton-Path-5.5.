import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className = '', label, error, icon, ...rest } = props;
  
  return (
    <div className="w-full space-y-2 group">
      {label && (
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative transition-all duration-200 transform group-focus-within:scale-[1.01]">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-xl bg-midnight-950 text-slate-100 transition-all duration-200
            placeholder:text-slate-600 font-semibold border border-white/10
            focus:bg-midnight-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none focus:shadow-lg
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-900
            ${icon ? 'pl-11' : 'px-4'} py-3.5 text-sm
            ${error ? 'bg-red-950/20 border-red-900 focus:border-red-500 focus:ring-red-500/10' : 'hover:border-white/20'}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1 font-medium animate-in slide-in-from-top-1 fade-in pl-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';