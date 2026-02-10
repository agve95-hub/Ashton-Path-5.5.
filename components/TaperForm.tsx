import React, { useState, useEffect } from 'react';
import { BenzoType, TaperSpeed, Metabolism } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent } from './ui/Card';
import { 
  Pill, Settings, Calendar, ArrowRight, User, Activity, History, 
  CheckCircle2, Scale, Feather, TrendingDown, BookOpen, Sliders, ChevronLeft 
} from 'lucide-react';

interface TaperFormValues {
  medication: BenzoType;
  dose: number;
  speed: TaperSpeed;
  age: number;
  metabolism: Metabolism;
  yearsUsing: number;
  startDate: string;
  name?: string;
  targetEndDate?: string;
}

interface Props {
  onGenerate: (med: BenzoType, dose: number, speed: TaperSpeed, age: number, metabolism: Metabolism, yearsUsing: number, date: string, name: string, targetEndDate?: string) => void;
  initialValues?: TaperFormValues;
}

const SPEED_ICONS: Record<TaperSpeed, React.ElementType> = {
    [TaperSpeed.SLOW]: Feather,
    [TaperSpeed.MODERATE]: TrendingDown,
    [TaperSpeed.ASHTON]: BookOpen,
    [TaperSpeed.CUSTOM]: Sliders
};

export const TaperForm: React.FC<Props> = (props) => {
  const { onGenerate, initialValues } = props;
  
  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [medication, setMedication] = useState<BenzoType>(initialValues?.medication || BenzoType.ALPRAZOLAM);
  const [dose, setDose] = useState<string>(initialValues?.dose?.toString() || '');
  
  const [name, setName] = useState<string>(initialValues?.name || '');
  const [age, setAge] = useState<string>(initialValues?.age?.toString() || '');
  const [metabolism, setMetabolism] = useState<Metabolism>(initialValues?.metabolism || 'average');
  const [yearsUsing, setYearsUsing] = useState<string>(initialValues?.yearsUsing?.toString() || '');

  const [speed, setSpeed] = useState<TaperSpeed>(initialValues?.speed || TaperSpeed.MODERATE);

  const [startDate, setStartDate] = useState<string>(initialValues?.startDate || new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState<string>(initialValues?.targetEndDate || '');

  // Auto-set target date for custom speed
  useEffect(() => {
    if (speed === TaperSpeed.CUSTOM && !targetEndDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 180); 
        setTargetEndDate(d.toISOString().split('T')[0]);
    }
  }, [speed, startDate, targetEndDate]);

  // Validation Logic
  const isStep1Valid = dose !== '' && parseFloat(dose) > 0;
  const isStep2Valid = name.trim().length > 0 && age !== '' && parseFloat(age) > 0 && yearsUsing !== '' && parseFloat(yearsUsing) >= 0;
  const isStep3Valid = !!speed;
  const isStep4Valid = !!startDate && (speed !== TaperSpeed.CUSTOM || !!targetEndDate);

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid) setCurrentStep(2);
    else if (currentStep === 2 && isStep2Valid) setCurrentStep(3);
    else if (currentStep === 3 && isStep3Valid) setCurrentStep(4);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep4Valid) return;

    const numDose = parseFloat(dose);
    const numAge = parseInt(age) || 40;
    const numYears = parseFloat(yearsUsing) || 1;

    if (numDose > 0) {
      onGenerate(medication, numDose, speed, numAge, metabolism, numYears, startDate, name, speed === TaperSpeed.CUSTOM ? targetEndDate : undefined);
    }
  };

  // Helper to render step indicator
  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex-1 h-1.5 rounded-full bg-midnight-950 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${step <= currentStep ? 'bg-teal-500' : 'bg-transparent'}`}
            style={{ width: step === currentStep ? '100%' : step < currentStep ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-4">
      <Card className="bg-midnight-800 shadow-xl shadow-black/20 border border-white/5 overflow-hidden rounded-2xl relative min-h-[500px] flex flex-col">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-white/5 bg-midnight-950/30">
            <StepIndicator />
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                        {currentStep === 1 && 'Medication & Dosing'}
                        {currentStep === 2 && 'Personal Factors'}
                        {currentStep === 3 && 'Reduction Pace'}
                        {currentStep === 4 && 'Timeline'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        {currentStep === 1 && 'What are you currently taking?'}
                        {currentStep === 2 && 'Help us tailor the plan to your biology.'}
                        {currentStep === 3 && 'How fast do you want to go?'}
                        {currentStep === 4 && 'When should we start?'}
                    </p>
                </div>
                <div className="text-xs font-bold text-slate-500 bg-midnight-950 px-3 py-1.5 rounded-lg border border-white/5">
                    Step {currentStep} / {totalSteps}
                </div>
            </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6 sm:p-8 flex-1">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            
            {/* STEP 1 */}
            {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <Label>Substance</Label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                                <Pill className="w-5 h-5" />
                            </div>
                            <select
                                value={medication}
                                onChange={(e) => setMedication(e.target.value as BenzoType)}
                                className="block w-full pl-12 pr-10 py-4 text-base border-white/10 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl bg-midnight-950 shadow-sm transition-all appearance-none border font-bold text-slate-200 cursor-pointer hover:border-white/20"
                            >
                                {Object.values(BenzoType).map((med) => (
                                <option key={med} value={med}>{med}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                                <Settings className="w-4 h-4 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-midnight-950/50 p-6 rounded-xl border border-white/5">
                        <Input 
                            label="Daily Total Dose (mg)"
                            type="number" step="0.125" min="0"
                            value={dose}
                            onChange={(e) => setDose(e.target.value)}
                            icon={<Scale className="w-4 h-4 text-teal-400" />}
                            placeholder="e.g. 1.5"
                            className="text-lg bg-midnight-900 border-white/10"
                            autoFocus
                        />
                        <p className="mt-3 text-[11px] text-slate-500 font-medium leading-relaxed">
                            Enter the total amount you take in a 24-hour period. We will calculate the reduction steps based on this baseline.
                        </p>
                    </div>
                </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Input 
                        label="Your Name"
                        type="text"
                        placeholder="e.g. Alex"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        icon={<User className="w-4 h-4" />}
                        autoFocus
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Input 
                            label="Your Age"
                            type="number"
                            min="18"
                            max="100"
                            placeholder="e.g. 35"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            icon={<Calendar className="w-4 h-4" />}
                        />
                        <Input 
                            label="Years Using"
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="e.g. 2.5"
                            value={yearsUsing}
                            onChange={(e) => setYearsUsing(e.target.value)}
                            icon={<History className="w-4 h-4" />}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Metabolism Speed</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <select
                                value={metabolism}
                                onChange={(e) => setMetabolism(e.target.value as Metabolism)}
                                className="block w-full pl-12 pr-10 py-4 text-sm border-white/10 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 rounded-xl bg-midnight-950 shadow-sm transition-all appearance-none border font-bold text-slate-200 cursor-pointer hover:border-white/20"
                            >
                                <option value="slow">Slow (Sensitive)</option>
                                <option value="average">Average</option>
                                <option value="fast">Fast</option>
                            </select>
                             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                                <Settings className="w-4 h-4 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    {Object.values(TaperSpeed).map((s) => {
                        const isSelected = speed === s;
                        const [title, sub] = s.split('(');
                        const cleanSub = sub ? sub.replace(')', '') : '';
                        const Icon = SPEED_ICONS[s] || Activity;
                        
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSpeed(s)}
                                className={`
                                    relative p-5 rounded-xl border text-left transition-all flex items-center justify-between group
                                    ${isSelected 
                                    ? 'bg-midnight-900 border-teal-500 ring-1 ring-teal-500/20 shadow-xl shadow-teal-500/5 z-10' 
                                    : 'bg-midnight-950/50 border-white/5 text-slate-500 hover:border-slate-700 hover:bg-midnight-900'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${isSelected ? 'bg-teal-500/10 text-teal-400' : 'bg-midnight-950 text-slate-600'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className={`font-bold text-sm block ${isSelected ? 'text-teal-400' : 'text-slate-300'}`}>{title.trim()}</span>
                                        {cleanSub && <span className={`text-xs font-semibold block mt-0.5 ${isSelected ? 'text-teal-400/70' : 'text-slate-500'}`}>{cleanSub}</span>}
                                    </div>
                                </div>
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Input 
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        icon={<Calendar className="w-5 h-5" />}
                    />
                    
                    {speed === TaperSpeed.CUSTOM && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Label className="text-teal-400">Target End Date</Label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Calendar className="w-5 h-5 text-teal-500" />
                                </div>
                                <input
                                    type="date"
                                    min={startDate}
                                    value={targetEndDate}
                                    onChange={(e) => setTargetEndDate(e.target.value)}
                                    className="block w-full pl-12 px-4 py-3.5 border border-teal-500/30 rounded-xl shadow-sm text-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm bg-teal-500/10 font-bold transition-all placeholder-teal-700"
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl">
                        <h4 className="text-sm font-bold text-teal-400 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Ready to Generate
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            We have everything we need. Click below to generate your personalized {medication.split('(')[0]} tapering schedule.
                        </p>
                    </div>
                </div>
            )}
            
          </form>
        </CardContent>

        {/* Footer Navigation */}
        <div className="p-6 sm:p-8 border-t border-white/5 bg-midnight-950/30 flex justify-between items-center gap-4">
            <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={currentStep === 1}
                className={`transition-opacity ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
            </Button>
            
            {currentStep < totalSteps ? (
                 <Button 
                    onClick={handleNext} 
                    disabled={
                        (currentStep === 1 && !isStep1Valid) ||
                        (currentStep === 2 && !isStep2Valid) ||
                        (currentStep === 3 && !isStep3Valid)
                    }
                    className="w-32"
                >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button 
                    onClick={handleSubmit} 
                    disabled={!isStep4Valid}
                    className="w-auto shadow-2xl shadow-teal-500/20"
                >
                    Generate Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
      </Card>
    </div>
  );
};