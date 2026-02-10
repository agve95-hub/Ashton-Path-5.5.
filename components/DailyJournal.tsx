import React, { useState, useMemo } from 'react';
import { DailyLogEntry } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Activity, CalendarDays, Brain, Zap, 
  Moon, Check, AlertTriangle, Eye, 
  UserX, Sun, Footprints, Music, Book, 
  Wind, Users, Palette, MessageCircle, Timer, Star, TrendingUp, ChevronDown,
  Flame, Trophy, Target
} from 'lucide-react';

interface Props {
  logs: DailyLogEntry[];
  onSave: (entry: DailyLogEntry) => void;
}

interface RangeInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass?: string;
}

const COMMON_ACTIVITIES = ["Walking", "Jogging", "Meditation", "Yoga", "Breathing", "Reading", "Socializing", "Therapy", "Music", "Art"];

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  "Walking": Footprints, "Jogging": Timer, "Meditation": Sun, "Yoga": Activity,
  "Breathing": Wind, "Reading": Book, "Socializing": Users, "Therapy": MessageCircle,
  "Music": Music, "Art": Palette
};

const RangeInput: React.FC<RangeInputProps> = ({ label, value, onChange, icon, colorClass = "bg-teal-500" }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
            <div className="p-1.5 bg-midnight-950 rounded-md text-slate-400 border border-white/5">{icon}</div>
            {label}
        </label>
        <span className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center ${value > 0 ? 'bg-teal-500 text-slate-900' : 'bg-midnight-950 text-slate-500 border border-white/5'}`}>
            {value}
        </span>
      </div>

      <div className="relative h-4 w-full flex items-center select-none touch-none group cursor-pointer">
        <div className="absolute left-0 right-0 h-2 bg-midnight-950 rounded-full overflow-hidden border border-white/5">
           <div className={`absolute top-0 left-0 h-full ${colorClass} opacity-80`} style={{ width: `${value * 10}%` }}></div>
        </div>
        <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        <div 
            className="absolute h-6 w-6 bg-slate-200 rounded-full shadow-md border border-slate-300 pointer-events-none transition-all duration-75 ease-out z-10 flex items-center justify-center"
            style={{ left: `calc(${value * 10}% - 12px)` }}
        >
            <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
        </div>
      </div>
    </div>
  );
};

type TimeRange = 'week' | 'month';

export const DailyJournal: React.FC<Props> = (props) => {
  const { logs, onSave } = props;
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  const existingEntry = useMemo(() => logs.find(l => l.date === date), [logs, date]);
  
  const [formData, setFormData] = useState<DailyLogEntry>({
    date, stress: 0, tremors: 0, dizziness: 0, musclePain: 0, nausea: 0, irritability: 0,
    depersonalization: 0, sensorySensitivity: 0, tinnitus: 0, sleepQuality: 5, sleepHours: 7,
    napped: false, restlessSleep: false, medications: '', activities: [], notes: '',
  });

  React.useEffect(() => {
    if (existingEntry) {
      setFormData({ ...existingEntry, 
        musclePain: existingEntry.musclePain || 0, nausea: existingEntry.nausea || 0, irritability: existingEntry.irritability || 0,
        depersonalization: existingEntry.depersonalization || 0, sensorySensitivity: existingEntry.sensorySensitivity || 0, tinnitus: existingEntry.tinnitus || 0,
        activities: existingEntry.activities || [], napped: existingEntry.napped || false, restlessSleep: existingEntry.restlessSleep || false
      });
    } else {
      setFormData({ date, stress: 0, tremors: 0, dizziness: 0, musclePain: 0, nausea: 0, irritability: 0, depersonalization: 0, sensorySensitivity: 0, tinnitus: 0, sleepQuality: 5, sleepHours: 7, napped: false, restlessSleep: false, medications: '', activities: [], notes: '' });
    }
  }, [date, existingEntry]);

  const toggleActivity = (activity: string) => {
      setFormData(prev => {
          const current = prev.activities || [];
          return current.includes(activity) ? { ...prev, activities: current.filter(a => a !== activity) } : { ...prev, activities: [...current, activity] };
      });
  };

  // --- Calculations for Wellness & Consistency ---

  const currentScore = useMemo(() => {
    const symptoms = [
      formData.stress, formData.tremors, formData.dizziness, 
      formData.musclePain || 0, formData.nausea || 0, formData.irritability || 0,
      formData.depersonalization || 0, formData.sensorySensitivity || 0, formData.tinnitus || 0
    ];
    // Filter out undefined if any
    const validSymptoms = symptoms.map(s => s || 0);
    const avgSymptom = validSymptoms.reduce((a, b) => a + b, 0) / validSymptoms.length;
    
    // Invert: 0 symptom is 10 points (Best). 10 symptom is 0 points (Worst).
    const symptomScore = 10 - avgSymptom;
    
    // Sleep is 0-10. 10 is best.
    const sleepScore = formData.sleepQuality;
    
    // Weighting: 50/50
    const total = ((symptomScore + sleepScore) / 2) * 10;
    return Math.round(total);
  }, [formData]);

  const streak = useMemo(() => {
    const dates = new Set(logs.map(l => l.date));
    let count = 0;
    const d = new Date();
    d.setHours(0,0,0,0);
    
    // Allow streak if today is missing but yesterday exists
    const todayStr = d.toISOString().split('T')[0];
    
    // If today is NOT logged yet, we start checking from yesterday to see the current streak
    if (!dates.has(todayStr)) {
        d.setDate(d.getDate() - 1);
        const yStr = d.toISOString().split('T')[0];
        // If yesterday is also missing, streak is 0
        if (!dates.has(yStr)) return 0;
    }
    
    // Iterate backwards
    while(true) {
        const str = d.toISOString().split('T')[0];
        if (dates.has(str)) {
            count++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return count;
  }, [logs]);

  const last7Days = useMemo(() => {
    const days = [];
    const dates = new Set(logs.map(l => l.date));
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const str = d.toISOString().split('T')[0];
        days.push({ 
            date: d, 
            logged: dates.has(str),
            isToday: i === 0,
            label: d.toLocaleDateString('en-US', { weekday: 'narrow' })
        });
    }
    return days;
  }, [logs]);

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-teal-400';
      if (score >= 50) return 'text-amber-400';
      return 'text-rose-400';
  };

  const getScoreLabel = (score: number) => {
      if (score >= 80) return 'Thriving';
      if (score >= 60) return 'Stabilizing';
      if (score >= 40) return 'Enduring';
      return 'Struggling';
  };

  // --- Chart Data ---

  const chartData = useMemo(() => {
    const daysToShow = timeRange === 'week' ? 7 : 30;
    
    return [...logs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-daysToShow)
      .map(log => {
        const symptoms = [log.stress, log.tremors, log.dizziness, log.musclePain || 0, log.depersonalization || 0, log.sensorySensitivity || 0];
        const avgSymptom = symptoms.reduce((a, b) => a + b, 0) / symptoms.length;
        
        // Format date differently based on range density
        const dateObj = new Date(log.date);
        const displayDate = timeRange === 'week' 
            ? dateObj.toLocaleDateString(undefined, { weekday: 'short' }) // Mon, Tue
            : dateObj.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }); // 10/24

        return { 
            ...log, 
            symptomScore: parseFloat(avgSymptom.toFixed(1)), 
            displayDate 
        };
      });
  }, [logs, timeRange]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <CalendarDays className="w-4 h-4" />
            </div>
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="w-full sm:w-auto appearance-none bg-midnight-800 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm font-bold text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 hover:border-white/20 transition-all cursor-pointer"
            >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
            </div>
        </div>
      </div>

      {/* NEW: Wellness & Consistency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Wellness Score Card */}
          <Card className="bg-gradient-to-br from-midnight-800 to-midnight-900 border-white/5 relative overflow-hidden">
             <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <Target className="w-4 h-4 text-slate-500" />
                        Daily Wellness Score
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded bg-midnight-950 border border-white/5 ${getScoreColor(currentScore)}`}>
                        {getScoreLabel(currentScore)}
                    </div>
                </div>
                
                <div className="flex items-end gap-3">
                    <span className={`text-6xl font-extrabold tracking-tighter leading-none ${getScoreColor(currentScore)}`}>
                        {currentScore}
                    </span>
                    <span className="text-slate-500 font-bold mb-1.5 text-sm">/ 100</span>
                </div>

                <div className="mt-4 h-1.5 w-full bg-midnight-950 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className={`h-full rounded-full transition-all duration-500 ${currentScore >= 50 ? 'bg-teal-500' : 'bg-rose-500'}`} 
                        style={{ width: `${currentScore}%` }}
                     ></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    Calculated from sleep quality vs. symptom intensity.
                </p>
             </CardContent>
             {/* Background glow */}
             <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none ${currentScore >= 50 ? 'bg-teal-500' : 'bg-rose-500'}`}></div>
          </Card>

          {/* Consistency Card */}
          <Card className="bg-midnight-800 border-white/5 relative overflow-hidden flex flex-col justify-between">
              <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <Zap className={`w-4 h-4 ${streak > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
                        Logging Streak
                    </div>
                    {streak > 3 && (
                        <Trophy className="w-5 h-5 text-amber-400" />
                    )}
                </div>

                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-100 tracking-tight">{streak}</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Days</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Consistency helps your doctor adjust your plan.</p>
                </div>
                
                <div className="flex justify-between items-center mt-5 pt-5 border-t border-white/5">
                    {last7Days.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div 
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all
                                    ${day.logged 
                                        ? 'bg-teal-500 border-teal-400 text-midnight-950 shadow-[0_0_10px_rgba(20,184,166,0.4)]' 
                                        : day.isToday
                                            ? 'bg-midnight-800 border-slate-600 text-slate-400'
                                            : 'bg-midnight-950 border-white/5 text-slate-700'
                                    }
                                `}
                            >
                                {day.logged && <Check className="w-4 h-4" strokeWidth={3} />}
                            </div>
                            <span className={`text-[9px] font-bold uppercase ${day.isToday ? 'text-teal-400' : 'text-slate-600'}`}>
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
              </CardContent>
          </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="border-white/5 shadow-lg bg-midnight-800 rounded-2xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-white/5 bg-midnight-950/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-200">
                        <div className="p-2 bg-teal-500/10 rounded-md text-teal-500">
                             <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-base font-bold block leading-tight">Trend Analysis</span>
                            <span className="text-xs text-slate-500 font-medium">Symptom intensity vs Sleep quality</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[320px] pt-8 px-4 pb-4">
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorSymptom" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis 
                                dataKey="displayDate" 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                                axisLine={false} 
                                tickLine={false} 
                                dy={15} 
                                minTickGap={20}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis 
                                domain={[0, 10]} 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                                axisLine={false} 
                                tickLine={false}
                                width={30}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: '1px solid #1e293b', 
                                    backgroundColor: '#0b101b', 
                                    color: '#e2e8f0', 
                                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.5)', 
                                    fontSize: '12px',
                                    padding: '12px'
                                }}
                                cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Legend 
                                iconType="circle" 
                                verticalAlign="top"
                                height={36}
                                wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', top: -10 }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="symptomScore" 
                                name="Symptom Intensity" 
                                stroke="#f43f5e" 
                                fill="url(#colorSymptom)" 
                                strokeWidth={3} 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="sleepQuality" 
                                name="Sleep Quality" 
                                stroke="#0ea5e9" 
                                fill="url(#colorSleep)" 
                                strokeWidth={3} 
                                strokeDasharray="0"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 bg-midnight-950/30 rounded-xl border border-dashed border-white/5 mx-4">
                        <div className="p-4 bg-midnight-900 rounded-full shadow-inner"><Activity className="w-8 h-8 opacity-30" /></div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-400">Not enough data</p>
                            <p className="text-xs text-slate-600 mt-1">Log at least 2 days to visualize trends.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>

      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-midnight-800">
                <CardHeader><span className="text-sm font-bold text-slate-300">Physical Symptoms</span></CardHeader>
                <CardContent className="space-y-6">
                    <RangeInput label="Stress / Anxiety" value={formData.stress} onChange={v => setFormData(prev => ({...prev, stress: v}))} icon={<Brain className="w-3.5 h-3.5" />} />
                    <RangeInput label="Tremors" value={formData.tremors} onChange={v => setFormData(prev => ({...prev, tremors: v}))} icon={<Activity className="w-3.5 h-3.5" />} />
                    <RangeInput label="Muscle Pain" value={formData.musclePain || 0} onChange={v => setFormData(prev => ({...prev, musclePain: v}))} icon={<Zap className="w-3.5 h-3.5" />} />
                </CardContent>
            </Card>

            <Card className="bg-midnight-800">
                 <CardHeader><span className="text-sm font-bold text-slate-300">Sensory & Cognitive</span></CardHeader>
                <CardContent className="space-y-6">
                    <RangeInput label="Depersonalization" value={formData.depersonalization || 0} onChange={v => setFormData(prev => ({...prev, depersonalization: v}))} icon={<UserX className="w-3.5 h-3.5" />} />
                    <RangeInput label="Sensory Sensitivity" value={formData.sensorySensitivity || 0} onChange={v => setFormData(prev => ({...prev, sensorySensitivity: v}))} icon={<Eye className="w-3.5 h-3.5" />} />
                    <RangeInput label="Tinnitus" value={formData.tinnitus || 0} onChange={v => setFormData(prev => ({...prev, tinnitus: v}))} icon={<Activity className="w-3.5 h-3.5" />} />
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 bg-midnight-800">
                <CardHeader><span className="text-sm font-bold text-slate-300">Sleep</span></CardHeader>
                <CardContent className="space-y-6">
                     <RangeInput label="Quality" value={formData.sleepQuality} onChange={v => setFormData(prev => ({...prev, sleepQuality: v}))} icon={<Star className="w-3.5 h-3.5" />} />
                     <div className="flex items-center gap-3">
                         <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 block mb-2">Hours</label>
                            <input type="number" step="0.5" value={formData.sleepHours} onChange={e => setFormData({...formData, sleepHours: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-midnight-950 border border-white/10 rounded-lg text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                         </div>
                     </div>
                     <div className="flex gap-3 pt-2">
                        <button key="Nap" type="button" onClick={() => setFormData({...formData, napped: !formData.napped})} 
                            className={`flex-1 py-4 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center justify-center gap-2.5 ${formData.napped ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-midnight-950 border-white/5 text-slate-500 hover:bg-midnight-900 hover:border-slate-700'}`}>
                            <Moon className={`w-5 h-5 ${formData.napped ? 'fill-indigo-500/20' : ''}`} />
                            Took a Nap
                        </button>
                        <button key="Restless" type="button" onClick={() => setFormData({...formData, restlessSleep: !formData.restlessSleep})} 
                            className={`flex-1 py-4 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center justify-center gap-2.5 ${formData.restlessSleep ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-midnight-950 border-white/5 text-slate-500 hover:bg-midnight-900 hover:border-slate-700'}`}>
                            <AlertTriangle className="w-5 h-5" />
                            Restless
                        </button>
                     </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-midnight-800">
                 <CardHeader><span className="text-sm font-bold text-slate-300">Activities & Notes</span></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {COMMON_ACTIVITIES.map(activity => {
                            const isSelected = (formData.activities || []).includes(activity);
                            const Icon = ACTIVITY_ICONS[activity] || Activity;
                            return (
                                <button key={activity} type="button" onClick={() => toggleActivity(activity)}
                                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group ${isSelected ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)]' : 'bg-midnight-950 border-white/5 text-slate-500 hover:border-slate-700 hover:bg-midnight-900'}`}>
                                    <div className={`p-3 rounded-full mb-3 transition-colors ${isSelected ? 'bg-teal-500 text-slate-900' : 'bg-midnight-900 text-slate-600 group-hover:text-slate-500'}`}>
                                        <Icon className="w-6 h-6" strokeWidth={isSelected ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-xs font-bold ${isSelected ? 'text-teal-300' : 'text-slate-500'}`}>
                                        {activity}
                                    </span>
                                    {isSelected && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-teal-500 shadow-glow-teal"></div>}
                                </button>
                            )
                        })}
                    </div>
                    <textarea className="w-full h-28 p-4 text-sm bg-midnight-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:bg-midnight-900 text-slate-200 transition-all outline-none resize-none placeholder:text-slate-600" placeholder="How are you feeling today?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </CardContent>
            </Card>
        </div>

        <div className="pt-2 flex justify-end">
             <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Check className="w-4 h-4 mr-2" /> Save Journal Entry
             </Button>
        </div>
      </form>
    </div>
  );
};