import React, { useState } from 'react';
import { ASHTON_SYMPTOMS } from '../constants';
import { Card, CardContent } from './ui/Card';
import { Search, Info, Brain, Activity, Eye } from 'lucide-react';

export const SymptomLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSymptoms = ASHTON_SYMPTOMS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (category: string) => {
    switch(category) {
        case 'Psychological': return <Brain className="w-4 h-4 text-rose-400" />;
        case 'Sensory': return <Eye className="w-4 h-4 text-violet-400" />;
        default: return <Activity className="w-4 h-4 text-teal-400" />;
    }
  };

  const getColor = (category: string) => {
    switch(category) {
        case 'Psychological': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        case 'Sensory': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
        default: return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-5 h-5" />
        </div>
        <input
            type="text"
            placeholder="Search symptoms (e.g., 'tinnitus', 'anxiety')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-midnight-900 border border-white/10 rounded-lg pl-11 pr-4 py-4 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all placeholder:text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSymptoms.map((symptom, idx) => (
            <Card key={idx} className="bg-midnight-800 border-white/5 hover:border-white/10 transition-colors h-full">
                <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${getColor(symptom.category)}`}>
                            {getIcon(symptom.category)}
                            {symptom.category}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-100 mb-2">{symptom.name}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            {symptom.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        ))}
        {filteredSymptoms.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                <Info className="w-8 h-8 opacity-50" />
                <p>No symptoms found matching "{searchTerm}"</p>
            </div>
        )}
      </div>
    </div>
  );
};