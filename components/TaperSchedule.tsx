import React, { useMemo } from 'react';
import { TaperStep, BenzoType, DailyLogEntry } from '../types';
import { Check, Plus, ArrowDown, Calendar, Lock, Info, ArrowRight } from 'lucide-react';
import { parseLocalDate, addDays, formatDate } from '../utils/dateHelpers';

interface Props {
  steps: TaperStep[];
  medication: BenzoType;
  isDiazepamCrossOver: boolean;
  logs?: DailyLogEntry[];
  startDate?: string;
  onToggleDay: (stepId: string, dayIndex: number) => void;
  onAddDay: (stepId: string) => void;
  onAttemptFutureCheck: (targetDate: Date, expectedDate: Date) => void;
}

// Helper to describe the dose in physical pill terms
const getPillDescription = (dose: number, med: BenzoType | 'Valium'): string => {
    if (dose <= 0) return '';
    
    let baseSize = 0;
    let unit = 'tab';
    
    if (med === 'Valium' || med === BenzoType.DIAZEPAM) {
        baseSize = 2; // 2mg standard
    } else if (med === BenzoType.CHLORDIAZEPOXIDE) {
        baseSize = 5; // 5mg capsule
        unit = 'cap';
    } else if (med === BenzoType.ALPRAZOLAM || med === BenzoType.CLONAZEPAM) {
        baseSize = 0.5; // 0.5mg standard
    } else if (med === BenzoType.LORAZEPAM) {
        baseSize = 1; // 1mg standard
    } else if (med === BenzoType.TEMAZEPAM) {
        baseSize = 15; // 15mg capsule
        unit = 'cap';
    } else {
        return '';
    }

    const ratio = dose / baseSize;
    // Fix: Use up to 3 decimal places to support 1/8th splits (0.125), avoiding 1.3 display for 1.25
    const cleanRatio = parseFloat(ratio.toFixed(3));
    
    if (cleanRatio === 1) return `(1 full ${baseSize}mg ${unit})`;
    if (cleanRatio === 0.5) return `(1/2 of ${baseSize}mg ${unit})`;
    if (cleanRatio === 0.25) return `(1/4 of ${baseSize}mg ${unit})`;
    if (cleanRatio === 0.125) return `(1/8 of ${baseSize}mg ${unit})`;
    
    return `(${cleanRatio} x ${baseSize}mg ${unit}${cleanRatio > 1 ? 's' : ''})`;
};

export const TaperSchedule: React.FC<Props> = (props) => {
  const { steps, medication, startDate, onToggleDay, onAddDay, onAttemptFutureCheck } = props;
  
  const stepsWithDates = useMemo(() => {
      let currentOffset = 0;
      const baseDate = startDate ? parseLocalDate(startDate) : new Date();
      return steps.map(step => {
          const start = addDays(baseDate, currentOffset);
          const end = addDays(baseDate, currentOffset + step.durationDays - 1);
          currentOffset += step.durationDays;
          return { ...step, startDate: start, endDate: end };
      });
  }, [steps, startDate]);

  const firstIncompleteIndex = steps.findIndex(s => !s.isCompleted);
  const visibleLimit = firstIncompleteIndex === -1 ? steps.length : firstIncompleteIndex + 2; 

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const shortMedName = medication.split('(')[0].trim();

  // Helper to find the "Next Due" day across the entire plan
  const findNextDue = () => {
    for(const step of steps) {
        const idx = step.completedDays.findIndex(d => !d);
        if(idx !== -1) return { stepId: step.id, dayIndex: idx };
    }
    return null;
  };
  const nextDue = findNextDue();

  const handleDayClick = (stepId: string, dayIndex: number, date: Date, isCompleted: boolean) => {
      if (isCompleted) {
          onToggleDay(stepId, dayIndex);
          return;
      }
      if (nextDue && (nextDue.stepId !== stepId || nextDue.dayIndex !== dayIndex)) {
          const nextDueStep = stepsWithDates.find(s => s.id === nextDue.stepId);
          if (nextDueStep) {
              const nextDueDate = addDays(nextDueStep.startDate, nextDue.dayIndex);
              onAttemptFutureCheck(date, nextDueDate);
          }
          return;
      }
      onToggleDay(stepId, dayIndex);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stat */}
      <div className="flex items-end justify-between px-1">
          <h3 className="text-2xl font-bold text-slate-100 leading-none">Your Schedule</h3>
          <div className="text-xs font-bold text-teal-400 bg-teal-400/10 px-3 py-1.5 rounded-full border border-teal-400/20">
              Week {stepsWithDates.find(s => !s.isCompleted)?.week || steps.length} of {steps.length}
          </div>
      </div>

      <div className="space-y-6">
        {stepsWithDates.map((step, index) => {
            if (index > visibleLimit) return null;

            const isAccessible = index === 0 || steps[index - 1].isCompleted;
            const isActive = isAccessible && !step.isCompleted;
            const isFuture = !isAccessible;
            const isComplete = step.isCompleted;

            return (
                <div 
                    key={step.id} 
                    className={`
                        transition-all duration-500
                        ${isFuture ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
                    `}
                >
                    <div className={`
                        rounded-2xl border transition-all duration-300 overflow-hidden relative
                        ${isActive 
                            ? 'bg-midnight-800 border-teal-500/40 shadow-glow-active' 
                            : 'bg-midnight-800 border-slate-800/60 shadow-card'}
                    `}>
                        
                        {/* Card Header */}
                        <div className="p-5 sm:p-7 flex gap-5 sm:gap-6 items-start">
                             {/* Week Bubble */}
                             <div className={`
                                w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-[2px] shadow-lg shrink-0 transition-all duration-300 mt-0.5
                                ${isActive 
                                    ? 'bg-teal-500 border-teal-400 text-midnight-950 shadow-teal-500/20' 
                                    : isComplete 
                                        ? 'bg-midnight-900 border-teal-500/30 text-teal-500' 
                                        : 'bg-midnight-900 border-slate-700 text-slate-600'}
                            `}>
                                {isComplete ? (
                                    <Check className="w-7 h-7" strokeWidth={3} />
                                ) : (
                                    <>
                                        <span className="text-xl font-extrabold leading-none">{step.week}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-0.5">Week</span>
                                    </>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="sm:flex justify-between items-start mb-5">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <h4 className="text-xl font-bold text-slate-100 leading-tight">
                                                {step.phase === 'crossover' && 'Substitution Step'}
                                                {step.phase === 'stabilize' && 'Stabilization Phase'}
                                                {step.phase === 'reduction' && 'Reduction Step'}
                                                {step.phase === 'jump' && 'Completion'}
                                            </h4>
                                            {isActive && <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf]"></div>}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5 mb-0.5" />
                                            {formatDate(step.startDate)} <ArrowRight className="w-3 h-3 text-slate-600 mx-1" /> {formatDate(step.endDate)}
                                        </div>
                                    </div>
                                    
                                    {step.notes && (
                                        <div className="hidden sm:block mt-1">
                                            <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800/50">
                                                {step.notes}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Simplified Dose Display */}
                                <div className="flex flex-col gap-3">
                                    {step.schedule.original > 0 && (
                                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                {step.schedule.original}mg {shortMedName}
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {getPillDescription(step.schedule.original, medication)}
                                            </span>
                                        </div>
                                    )}
                                    {step.schedule.diazepam > 0 && (
                                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/10">
                                            <div className="flex items-center gap-3 text-sm font-bold text-teal-400">
                                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                                {step.schedule.diazepam}mg Valium
                                            </div>
                                            <span className="text-xs text-teal-500/60 font-medium">
                                                {getPillDescription(step.schedule.diazepam, 'Valium')}
                                            </span>
                                        </div>
                                    )}
                                    {step.schedule.original === 0 && step.schedule.diazepam === 0 && (
                                        <span className="text-sm font-bold text-teal-500">Free (0mg)</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Daily Checklist */}
                        {isAccessible && (
                            <div className="px-5 pb-5 space-y-2.5">
                                {step.completedDays.map((isDone, dayIndex) => {
                                    const dayDate = addDays(step.startDate, dayIndex);
                                    const isToday = today.getTime() === dayDate.getTime();
                                    const globalDay = step.globalDayStart + dayIndex;
                                    const isNext = nextDue && nextDue.stepId === step.id && nextDue.dayIndex === dayIndex;

                                    return (
                                        <button
                                            key={`${step.id}-${dayIndex}`}
                                            onClick={() => handleDayClick(step.id, dayIndex, dayDate, isDone)}
                                            className={`
                                                group relative w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left
                                                ${isToday 
                                                    ? 'bg-teal-500/5 border-teal-500/50 ring-1 ring-teal-500/20' 
                                                    : 'bg-midnight-900 border-slate-800 hover:border-slate-700'}
                                                ${isDone ? 'opacity-70 grayscale-[0.3]' : 'opacity-100'}
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    w-12 h-12 rounded-lg flex flex-col items-center justify-center border font-bold text-sm shrink-0
                                                    ${isToday 
                                                        ? 'bg-teal-500 text-midnight-950 border-teal-500' 
                                                        : 'bg-midnight-950 text-slate-400 border-slate-800'}
                                                `}>
                                                    <span className="leading-none">{dayDate.getDate()}</span>
                                                    <span className="text-[8px] uppercase font-extrabold opacity-70 leading-none mt-0.5">{formatDate(dayDate, {month:'short'})}</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day {globalDay}</span>
                                                        {isToday && <span className="text-[9px] font-bold bg-teal-500 text-midnight-950 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Today</span>}
                                                    </div>
                                                    <span className={`font-bold text-base ${isToday ? 'text-teal-50' : 'text-slate-300'}`}>
                                                        {formatDate(dayDate, {weekday:'long'})}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`
                                                w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                                ${isDone 
                                                    ? 'bg-teal-500 border-teal-500 text-midnight-900 scale-100' 
                                                    : isNext
                                                        ? 'border-slate-600 bg-transparent text-transparent group-hover:border-teal-500 group-hover:bg-teal-500/10'
                                                        : 'border-slate-800 bg-slate-900 text-slate-700'}
                                            `}>
                                                {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : !isNext && <Lock className="w-3.5 h-3.5" />}
                                            </div>
                                        </button>
                                    );
                                })}
                                
                                {isActive && (
                                    <button 
                                        onClick={() => onAddDay(step.id)}
                                        className="w-full py-3.5 mt-5 text-xs font-bold text-slate-500 uppercase tracking-widest border border-dashed border-slate-800 rounded-xl hover:bg-slate-800 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Extend Phase
                                    </button>
                                )}
                            </div>
                        )}

                        {!isActive && !isComplete && (
                            <div className="px-7 pb-7 pt-2">
                                <p className="text-sm text-slate-500 italic">Complete previous steps to unlock this week.</p>
                            </div>
                        )}

                            {!isActive && isComplete && (
                            <div className="px-7 pb-7 pt-2">
                                <p className="text-sm font-bold text-teal-400/80 flex items-center gap-2">
                                    <Check className="w-4 h-4" /> All doses completed
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )
        })}
        
        {visibleLimit < steps.length && (
             <div className="flex justify-center pt-8">
                 <button className="flex flex-col items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors group">
                     <div className="p-3.5 rounded-full border border-slate-800 bg-midnight-800 group-hover:border-teal-500/50 shadow-lg">
                         <ArrowDown className="w-5 h-5 animate-bounce" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-wider">Load More Weeks</span>
                 </button>
             </div>
        )}
      </div>
    </div>
  );
};