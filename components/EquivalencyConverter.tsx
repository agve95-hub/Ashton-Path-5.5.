import React, { useState } from 'react';
import { BenzoType } from '../types';
import { BENZO_DETAILS } from '../constants';
import { Card, CardContent, CardHeader } from './ui/Card';
import { ArrowRightLeft, Scale, Clock } from 'lucide-react';

export const EquivalencyConverter: React.FC = () => {
  const [selectedMed, setSelectedMed] = useState<BenzoType>(BenzoType.ALPRAZOLAM);
  const [dose, setDose] = useState<string>('1.0');

  const details = BENZO_DETAILS[selectedMed];
  const diazepamDetails = BENZO_DETAILS[BenzoType.DIAZEPAM];
  
  const calculatedEquivalent = parseFloat(dose || '0') * details.diazepamEquivalence;
  
  // Extract max hours from "6-12 hrs" string for bar visualization
  const getHalfLifeMax = (str: string) => parseInt(str.split('-')[1] || str.split('-')[0]) || 10;
  
  const medHalfLife = getHalfLifeMax(details.halfLife);
  const diazepamHalfLife = getHalfLifeMax(diazepamDetails.halfLife);
  const maxScale = Math.max(medHalfLife, diazepamHalfLife);

  return (
    <Card className="overflow-hidden bg-midnight-800 border-white/5">
      <CardHeader className="bg-midnight-900 border-b border-white/5 pb-4">
         <div className="flex items-center gap-2 text-teal-400">
            <Scale className="w-5 h-5" />
            <h3 className="font-bold text-slate-100">Equivalency Calculator</h3>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
            {/* Input Side */}
            <div className="p-6 md:p-8 flex-1 space-y-6 bg-midnight-900">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medication</label>
                    <div className="relative">
                        <select
                            value={selectedMed}
                            onChange={(e) => setSelectedMed(e.target.value as BenzoType)}
                            className="w-full bg-midnight-950 border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:border-teal-500 transition-colors appearance-none cursor-pointer"
                        >
                            {Object.values(BenzoType).filter(b => b !== BenzoType.DIAZEPAM).map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <ArrowRightLeft className="w-4 h-4 rotate-90" />
                         </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Dose (mg)</label>
                    <input 
                        type="number" 
                        min="0" 
                        step="0.125"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        className="w-full bg-midnight-950 border border-white/10 rounded-lg px-4 py-3 text-2xl font-bold text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                </div>
            </div>

            {/* Result Side */}
            <div className="p-6 md:p-8 flex-1 bg-midnight-950 border-t md:border-t-0 md:border-l border-white/5 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                 
                 <div className="relative z-10">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ashton Manual Equivalent</p>
                     <div className="flex items-baseline gap-2 mb-1">
                         <span className="text-5xl font-extrabold text-teal-400 tracking-tight">
                            {isNaN(calculatedEquivalent) ? 0 : parseFloat(calculatedEquivalent.toFixed(2))}
                         </span>
                         <span className="text-xl font-bold text-slate-400">mg</span>
                     </div>
                     <p className="text-lg font-bold text-slate-200 mb-6">Diazepam (Valium)</p>
                     
                     {/* Half Life Visualization */}
                     <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500">
                            <Clock className="w-3.5 h-3.5" /> Half-Life Comparison
                        </div>
                        
                        {/* Selected Med Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                <span>{details.name}</span>
                                <span>{details.halfLife}</span>
                            </div>
                            <div className="h-2 bg-midnight-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-slate-600 rounded-full" 
                                    style={{ width: `${(medHalfLife / maxScale) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Diazepam Bar */}
                        <div className="space-y-1">
                             <div className="flex justify-between text-[10px] font-bold text-teal-400 uppercase">
                                <span>Diazepam</span>
                                <span>{diazepamDetails.halfLife}</span>
                            </div>
                            <div className="h-2 bg-midnight-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                                    style={{ width: `${(diazepamHalfLife / maxScale) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                            Diazepam's long half-life provides a self-tapering effect, smoothing out withdrawal peaks and valleys.
                        </p>
                     </div>
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};