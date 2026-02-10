import React from 'react';
import { Button } from './ui/Button';
import { AlertTriangle, ShieldCheck, AlertOctagon, Info, FileWarning } from 'lucide-react';

interface Props {
  onAccept: () => void;
  isOpen: boolean;
}

export const DisclaimerModal: React.FC<Props> = ({ onAccept, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-midnight-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-midnight-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-amber-950/20 p-6 border-b border-amber-900/30 flex items-start gap-4 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
          <div className="p-3 bg-amber-900/30 rounded-lg text-amber-500 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-900/10">
            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-amber-100 leading-tight mb-1">Important Safety Warning</h2>
            <p className="text-amber-200/60 text-xs font-bold uppercase tracking-wider">Please read carefully before proceeding</p>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-midnight-900">
          
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              This application is an educational tool designed to visualize tapering schedules based on the <strong className="text-slate-100">Ashton Manual</strong> principles.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              <strong className="text-rose-400">It is NOT a medical device and does NOT provide medical advice.</strong> You must consult with a qualified healthcare professional before making any changes to your medication regimen.
            </p>
          </div>

          {/* Critical Warnings */}
          <div className="space-y-3">
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 flex gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-400">Seizure Risk & Abrupt Cessation</h4>
                <p className="text-xs text-rose-200/70 leading-relaxed">
                  Never stop benzodiazepines abruptly ("cold turkey"). Rapid withdrawal can cause life-threatening seizures, psychosis, and severe excitotoxicity.
                </p>
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-indigo-300">Individual Variation</h4>
                <p className="text-xs text-indigo-200/70 leading-relaxed">
                  Calculators cannot account for your unique biology. The Ashton Manual emphasizes "listening to your body." If symptoms become severe, hold the dose—do not force a reduction.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-midnight-950 rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileWarning className="w-3 h-3" />
                User Agreement
            </h4>
            <ul className="space-y-3">
              {[
                "I will not use this app as a substitute for a doctor.",
                "I verify that I am under the care of a medical professional.",
                "I assume full responsibility for my own health decisions."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-midnight-950/50 shrink-0">
          <Button 
            onClick={onAccept} 
            size="lg" 
            className="w-full h-12 text-base transition-transform active:scale-[0.98]"
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
};