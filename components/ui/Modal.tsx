import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = (props) => {
  const { isOpen, onClose, children, title } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-midnight-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-white/5 ring-1 ring-white/5">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0 bg-midnight-900 sticky top-0 z-10">
           <h2 className="text-lg font-bold text-slate-100">{title}</h2>
           <button 
             onClick={onClose} 
             className="p-2 -mr-2 hover:bg-midnight-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
        <div className="p-0">
           {children}
        </div>
      </div>
    </div>
  );
};