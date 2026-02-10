import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { BookOpen, ArrowRight, Shuffle, Activity, UserCheck, Calculator, Search, FileText, ChevronRight } from 'lucide-react';
import { EquivalencyConverter } from './EquivalencyConverter';
import { SymptomLibrary } from './SymptomLibrary';

type ViewMode = 'guide' | 'calculator' | 'symptoms';

export const ManualReference: React.FC = () => {
  const [view, setView] = useState<ViewMode>('guide');

  const navItems: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'guide', label: 'The Protocol', icon: BookOpen },
    { id: 'calculator', label: 'Converter', icon: Calculator },
    { id: 'symptoms', label: 'Symptom Glossary', icon: Search },
  ];

  return (
    <div className="space-y-8">
      
      {/* Navigation - Stacked Vertical */}
      <div className="grid grid-cols-1 gap-4">
        {navItems.map((item) => (
             <button 
                key={item.id}
                onClick={() => setView(item.id)}
                className={`
                    w-full p-5 rounded-2xl border text-left flex items-center justify-between transition-all group
                    ${view === item.id 
                        ? 'bg-midnight-800 border-teal-500/50 shadow-xl ring-1 ring-teal-500/20' 
                        : 'bg-midnight-900 border-white/5 hover:border-white/10 hover:bg-midnight-800/50'}
                `}
              >
                <div className="flex items-center gap-5">
                    <div className={`
                        p-3 rounded-xl transition-colors
                        ${view === item.id ? 'bg-teal-500 text-slate-900' : 'bg-midnight-950 text-slate-500 group-hover:text-slate-300'}
                    `}>
                        <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <span className={`block text-lg font-bold ${view === item.id ? 'text-teal-400' : 'text-slate-200'}`}>
                            {item.label}
                        </span>
                        {view === item.id && (
                             <span className="text-xs text-teal-500/80 font-medium animate-in fade-in">Currently Viewing</span>
                        )}
                    </div>
                </div>
                {view !== item.id && <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />}
             </button>
        ))}
      </div>

      <div className="pt-4">
      {view === 'calculator' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 mb-3 tracking-tight">Equivalency Converter</h2>
                <p className="text-slate-400 text-lg">Calculate Diazepam equivalents and compare half-lives to understand the importance of substitution.</p>
             </div>
             <EquivalencyConverter />
          </div>
      )}

      {view === 'symptoms' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 mb-3 tracking-tight">Chapter 3: Symptom Guide</h2>
                <p className="text-slate-400 text-lg">Explanations and reassurances from Professor Ashton regarding common withdrawal sensations.</p>
             </div>
             <SymptomLibrary />
          </div>
      )}

      {view === 'guide' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Card className="rounded-2xl border-white/5">
            <CardContent className="p-8 bg-midnight-800 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-5 bg-teal-500/10 rounded-full border border-teal-500/20 shrink-0">
                <FileText className="w-10 h-10 text-teal-500" />
            </div>
            <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight mb-2">
                    Ashton Manual Core Principles
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                    Key takeaways from <em>Benzodiazepines: How They Work and How to Withdraw</em> by Prof. C. Heather Ashton (2002).
                </p>
            </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
            <Card className="h-full border-indigo-500/20 shadow-sm rounded-2xl bg-midnight-800">
                <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 p-6">
                    <h3 className="font-serif font-bold text-indigo-300 flex items-center gap-3 text-xl">
                        <Shuffle className="w-6 h-6" />
                        Stage 1: The Crossover
                    </h3>
                </CardHeader>
                <CardContent className="space-y-4 text-base text-slate-400 leading-relaxed font-medium p-8">
                    <p>
                        <strong className="text-slate-200 block mb-1">Why switch to Diazepam?</strong>
                        Short-acting benzodiazepines (Xanax, Ativan) cause "inter-dose withdrawal," where blood levels drop rapidly between doses. Diazepam has a very long half-life (up to 200 hours), providing a smooth, stable blood level that acts as a "cushion" during withdrawal.
                    </p>
                    <p>
                        <strong className="text-slate-200 block mb-1">How to do it:</strong>
                        Switching should be gradual. Replace one dose at a time (e.g., the night dose) with an equivalent dose of Diazepam. Do this every week until fully switched.
                    </p>
                </CardContent>
            </Card>

            <Card className="h-full border-teal-500/20 shadow-sm rounded-2xl bg-midnight-800">
                <CardHeader className="bg-teal-500/10 border-b border-teal-500/20 p-6">
                    <h3 className="font-serif font-bold text-teal-300 flex items-center gap-3 text-xl">
                        <Activity className="w-6 h-6" />
                        Stage 2: Slow Tapering
                    </h3>
                </CardHeader>
                <CardContent className="space-y-4 text-base text-slate-400 leading-relaxed font-medium p-8">
                    <p>
                        <strong className="text-slate-200 block mb-1">The Golden Rule:</strong>
                        "There is no need to hurry." The rate of tapering should be individually tailored.
                    </p>
                    <div className="bg-teal-500/5 p-6 rounded-xl border border-teal-500/10">
                        <strong className="text-teal-400 block mb-3 text-xs uppercase tracking-wider">Typical Rate</strong>
                        <ul className="space-y-2 text-teal-300/80">
                            {[
                                "Above 40mg: Reduce by 2-5mg/week",
                                "20mg - 40mg: Reduce by 2mg/week",
                                "Below 20mg: Reduce by 1mg/week",
                                "Below 10mg: Reduce by 0.5mg/week"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="bg-amber-900/10 border border-amber-900/20 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-center">
            <div className="p-5 bg-midnight-900 rounded-full text-amber-500 shadow-sm shrink-0">
                <UserCheck className="w-10 h-10" />
            </div>
            <div className="space-y-3 text-center sm:text-left">
                <h3 className="font-serif font-bold text-amber-500 text-xl">The Importance of Control</h3>
                <p className="text-base text-amber-200/60 leading-relaxed font-medium">
                    Professor Ashton emphasizes that the patient must be in control of their own taper. The doctor provides the prescription and medical supervision, but the patient decides when they are ready for the next cut.
                </p>
                <p className="text-base font-bold text-amber-400 pt-2">
                    "Withdrawal is not a race."
                </p>
            </div>
        </div>
        
        <div className="flex justify-center pt-4 pb-8">
            <a 
                href="https://www.benzo.org.uk/manual/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-teal-400 font-bold hover:text-teal-300 bg-midnight-800 px-8 py-4 rounded-full hover:bg-midnight-700 transition-colors border border-white/10 text-lg shadow-lg"
            >
                Read the full manual online <ArrowRight className="w-5 h-5" />
            </a>
        </div>
        </div>
      )}
      </div>
    </div>
  );
};