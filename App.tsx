
import React, { useState, useEffect, useRef } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { FullDisclaimer } from './components/FullDisclaimer';
import { TaperForm } from './components/TaperForm';
import { TaperSchedule } from './components/TaperSchedule';
import { TaperChart } from './components/TaperChart';
import { DailyJournal } from './components/DailyJournal';
import { UserProfileEditor } from './components/UserProfileEditor';
import { ReminderSettings } from './components/ReminderSettings';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { MagicLinkSent } from './components/MagicLinkSent';
import { ManualReference } from './components/ManualReference';
import { MissedCheckinModal } from './components/MissedCheckinModal';
import { TaperPlan, BenzoType, TaperSpeed, DailyLogEntry, UserProfile, Metabolism } from './types';
import { calculateTaperSchedule } from './services/taperCalculator';
import { getMissedDays, shiftSchedule, MissedDay, parseLocalDate } from './utils/dateHelpers';
import { sendNotification } from './utils/reminderService';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { 
  BookOpen, LogOut, ClipboardCheck, 
  Settings, Activity, TrendingDown, RefreshCw, AlertCircle, 
  User, Home, Info, AlertTriangle, Mail, ChevronRight, BellRing, Heart
} from 'lucide-react';
import { generateMockHistory } from './mockData';

type Tab = 'overview' | 'log' | 'manual' | 'settings';
type AuthView = 'login' | 'register' | 'magic-link-sent';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  
  // App State
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isFullDisclaimerOpen, setIsFullDisclaimerOpen] = useState(false);
  const [plan, setPlan] = useState<TaperPlan | null>(null);
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', avatar: '', notificationsEnabled: false });
  
  // Missed Checkin State
  const [missedDays, setMissedDays] = useState<MissedDay[]>([]);
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);

  // Edit/Reset Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Notification Interval Ref
  const notificationInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationDate = useRef<string>('');

  // Load state from local storage on mount
  useEffect(() => {
    const session = localStorage.getItem('ashton_session');
    if (session) setIsAuthenticated(true);

    const savedDisclaimer = localStorage.getItem('ashton_disclaimer');
    if (savedDisclaimer === 'true') setHasAcceptedDisclaimer(true);

    const savedPlan = localStorage.getItem('ashton_plan');
    if (savedPlan) {
      try {
        const parsed = JSON.parse(savedPlan);
        if (parsed.steps) {
            parsed.steps = parsed.steps.map((s: any) => {
                const duration = s.durationDays || 7;
                let completed = Array.isArray(s.completedDays) ? [...s.completedDays] : [];
                if (completed.length !== duration) {
                    if (completed.length < duration) while (completed.length < duration) completed.push(false);
                    else completed = completed.slice(0, duration);
                }
                return { ...s, durationDays: duration, completedDays: completed, globalDayStart: s.globalDayStart || 1 };
            });
        }
        setPlan(parsed);
      } catch (e) { console.error("Failed to parse saved plan", e); }
    }

    const savedLogs = localStorage.getItem('ashton_logs');
    if (savedLogs) {
        try { setLogs(JSON.parse(savedLogs)); } catch (e) { console.error("Failed to parse saved logs", e); }
    } else {
        const mockLogs = generateMockHistory();
        setLogs(mockLogs);
        localStorage.setItem('ashton_logs', JSON.stringify(mockLogs));
    }

    const savedProfile = localStorage.getItem('ashton_profile');
    if (savedProfile) {
        try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error("Failed to parse profile", e); }
    }
  }, []);

  // Check for missed days on load
  useEffect(() => {
      if (isAuthenticated && plan) {
          const missed = getMissedDays(plan);
          if (missed.length > 0) {
              setMissedDays(missed);
              setIsMissedModalOpen(true);
          } else {
              setIsMissedModalOpen(false);
          }
      }
  }, [isAuthenticated, plan]);

  // Reminder System Loop
  useEffect(() => {
    if (notificationInterval.current) clearInterval(notificationInterval.current);

    if (isAuthenticated && userProfile.notificationsEnabled && userProfile.notificationTime) {
        notificationInterval.current = setInterval(() => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const todayStr = now.toISOString().split('T')[0];

            // Check if time matches AND we haven't already sent one today
            if (currentTime === userProfile.notificationTime && lastNotificationDate.current !== todayStr) {
                sendNotification("Daily Check-in", "It's time to log your symptoms and track your progress.");
                lastNotificationDate.current = todayStr;
            }
        }, 15000); // Check every 15 seconds
    }

    return () => {
        if (notificationInterval.current) clearInterval(notificationInterval.current);
    };
  }, [isAuthenticated, userProfile]);


  // Auth Handlers
  const handleInitiateLogin = (email: string) => {
    setPendingEmail(email);
    setAuthView('magic-link-sent');
  };

  const handleInitiateRegister = (name: string, email: string) => {
    setPendingEmail(email);
    const newProfile = { ...userProfile, name };
    setUserProfile(newProfile);
    localStorage.setItem('ashton_profile', JSON.stringify(newProfile));
    setAuthView('magic-link-sent');
  };

  const handleCompleteAuth = () => {
      localStorage.setItem('ashton_session', 'true');
      setIsAuthenticated(true);
      setAuthView('login'); // Reset view for next logout
  };

  const handleLogout = () => {
    localStorage.removeItem('ashton_session');
    setIsAuthenticated(false);
    setAuthView('login');
    setActiveTab('overview');
  };

  // App Handlers
  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    localStorage.setItem('ashton_disclaimer', 'true');
  };

  const handleGeneratePlan = (med: BenzoType, dose: number, speed: TaperSpeed, age: number, metabolism: Metabolism, yearsUsing: number, date: string, name: string, targetEndDate?: string) => {
    const newPlan = calculateTaperSchedule(med, dose, speed, age, metabolism, yearsUsing, date, targetEndDate);
    setPlan(newPlan);
    localStorage.setItem('ashton_plan', JSON.stringify(newPlan));
    
    // Update profile if name is provided
    if (name && name !== userProfile.name) {
        const newProfile = { ...userProfile, name };
        setUserProfile(newProfile);
        localStorage.setItem('ashton_profile', JSON.stringify(newProfile));
    }

    setActiveTab('overview');
    setIsEditModalOpen(false); 
  };

  const handleToggleDay = (stepId: string, dayIndex: number) => {
      if (!plan) return;
      const updatedSteps = plan.steps.map(step => {
          if (step.id === stepId) {
              const newDays = [...step.completedDays];
              if (dayIndex >= 0 && dayIndex < newDays.length) {
                  newDays[dayIndex] = !newDays[dayIndex];
                  const isNowCompleted = newDays.every(d => d === true);
                  return { ...step, completedDays: newDays, isCompleted: isNowCompleted };
              }
          }
          return step;
      });
      const updatedPlan = { ...plan, steps: updatedSteps };
      setPlan(updatedPlan);
      localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
  };

  const handleAddDay = (stepId: string) => {
    if (!plan) return;
    const updatedSteps = plan.steps.map(step => {
        if (step.id === stepId) {
            return { 
                ...step, 
                durationDays: step.durationDays + 1,
                completedDays: [...step.completedDays, false]
            };
        }
        return step;
    });
    const updatedPlan = { ...plan, steps: updatedSteps };
    setPlan(updatedPlan);
    localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
  };
  
  const handleConfirmMissedTaken = () => {
      if (!plan) return;
      const updatedSteps = [...plan.steps];
      let hasChanges = false;
      missedDays.forEach(missed => {
          const stepIndex = updatedSteps.findIndex(s => s.id === missed.stepId);
          if (stepIndex !== -1) {
              const step = { ...updatedSteps[stepIndex] };
              const newDays = [...step.completedDays];
              if (newDays[missed.dayIndex] === false) {
                  newDays[missed.dayIndex] = true;
                  step.completedDays = newDays;
                  step.isCompleted = newDays.every(d => d === true);
                  updatedSteps[stepIndex] = step;
                  hasChanges = true;
              }
          }
      });
      if (hasChanges) {
          const updatedPlan = { ...plan, steps: updatedSteps };
          setPlan(updatedPlan);
          localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
      }
      setIsMissedModalOpen(false);
      setMissedDays([]); // Clear
  };
  
  const handleRescheduleMissed = () => {
      if (!plan) return;
      const updatedPlan = shiftSchedule(plan, missedDays);
      setPlan(updatedPlan);
      localStorage.setItem('ashton_plan', JSON.stringify(updatedPlan));
      setIsMissedModalOpen(false);
      setMissedDays([]); // Clear to update UI immediately
  };

  const handleAttemptFutureCheck = (targetDate: Date, expectedDate: Date) => {
      if (!plan) return;
      const detected = getMissedDays(plan);
      if (detected.length > 0) {
          setMissedDays(detected);
          setIsMissedModalOpen(true);
          return;
      } else {
          // Mock a missed day entry for the *Next Due* day so they can handle it.
          const currentStep = plan.steps.find(s => !s.isCompleted);
          if (currentStep) {
               const dayIdx = currentStep.completedDays.findIndex(d => !d);
               if (dayIdx !== -1) {
                    const nextDueDay = {
                        stepId: currentStep.id,
                        dayIndex: dayIdx,
                        date: expectedDate, 
                        stepWeek: currentStep.week
                    };
                    setMissedDays([nextDueDay]);
                    setIsMissedModalOpen(true);
               }
          }
          return;
      }
  };

  const handleResetRequest = () => setIsEditModalOpen(true);

  const handleSaveLog = (entry: DailyLogEntry) => {
    const updatedLogs = logs.filter(l => l.date !== entry.date).concat(entry);
    setLogs(updatedLogs);
    localStorage.setItem('ashton_logs', JSON.stringify(updatedLogs));
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('ashton_profile', JSON.stringify(profile));
  };

  const completedSteps = plan ? plan.steps.filter(s => s.isCompleted).length : 0;
  const totalSteps = plan ? plan.steps.length : 0;
  const progressPercentage = plan ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const currentStep = plan?.steps.find(s => !s.isCompleted);
  const currentValiumDose = currentStep?.diazepamDose || 0;
  const currentOriginalDose = currentStep?.originalMedDose || 0;
  const totalDays = plan ? plan.steps.reduce((acc, s) => acc + s.durationDays, 0) : 0;
  const completedDaysCount = plan ? plan.steps.reduce((acc, s) => acc + s.completedDays.filter(Boolean).length, 0) : 0;
  const daysRemaining = Math.max(0, totalDays - completedDaysCount);

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-midnight-900/95 backdrop-blur-md border-t border-white/5 px-6 pb-safe pt-2 flex justify-between items-center z-50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] max-w-md mx-auto">
      {[
        { id: 'overview', label: 'Home', icon: Home },
        { id: 'log', label: 'Log', icon: ClipboardCheck },
        { id: 'manual', label: 'Learn', icon: BookOpen },
        { id: 'settings', label: 'Profile', icon: User },
      ].map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className="flex flex-col items-center gap-1 p-2 rounded-md transition-all active:scale-95"
          >
            <div className={`
              p-1.5 rounded-full transition-all duration-300
              ${isActive ? 'bg-teal-500/10 text-teal-400 translate-y-[-2px]' : 'text-slate-500'}
            `}>
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-teal-400' : 'text-slate-600'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-midnight-950 flex font-sans selection:bg-teal-500/30 selection:text-teal-200 text-slate-200 justify-center">
      
      {/* Wrapper to center content on Desktop */}
      <div className="w-full max-w-md bg-midnight-900 min-h-screen shadow-2xl relative">
      
      {!isAuthenticated ? (
           authView === 'login' 
            ? <LoginPage onLogin={handleInitiateLogin} onSwitchToRegister={() => setAuthView('register')} /> 
            : authView === 'register' 
                ? <RegisterPage onRegister={handleInitiateRegister} onSwitchToLogin={() => setAuthView('login')} />
                : <MagicLinkSent email={pendingEmail} onResend={() => {}} onConfirm={handleCompleteAuth} onBack={() => setAuthView('login')} />
      ) : (
        <>
            <DisclaimerModal isOpen={!hasAcceptedDisclaimer} onAccept={handleAcceptDisclaimer} />
            <MissedCheckinModal isOpen={isMissedModalOpen} missedDays={missedDays} onConfirmTaken={handleConfirmMissedTaken} onReschedule={handleRescheduleMissed} />
            <FullDisclaimer isOpen={isFullDisclaimerOpen} onClose={() => setIsFullDisclaimerOpen(false)} />
            
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Reconfigure Taper Plan">
                <div className="p-0">
                    <div className="bg-amber-900/20 p-6 border-b border-amber-900/30 text-sm text-amber-200 flex items-start gap-4 leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p>Updating your schedule will regenerate the timeline. Past progress tracking might require manual adjustment if dates shift significantly.</p>
                    </div>
                    <TaperForm 
                        onGenerate={handleGeneratePlan} 
                        initialValues={plan ? {
                            medication: plan.medication,
                            dose: plan.startDose,
                            speed: plan.speed,
                            age: plan.age,
                            metabolism: plan.metabolism,
                            yearsUsing: plan.yearsUsing,
                            startDate: plan.startDate,
                            name: userProfile.name
                        } : undefined}
                    />
                </div>
            </Modal>

            <MobileNav />

            {/* Main Content */}
            <main className="flex-1 min-h-screen pt-12 px-5 pb-32 overflow-x-hidden w-full">
                <div className="w-full mx-auto">
                {!plan ? (
                <div className="animate-fade-in-up pt-4">
                    <div className="mb-12 text-center space-y-5">
                        <div className="w-16 h-16 bg-teal-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-teal-600/20 mb-8 rotate-3">A</div>
                        <h2 className="font-serif text-5xl sm:text-6xl text-slate-100 mb-4 tracking-tight leading-none">Begin your path</h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                            A compassionate, science-backed approach to benzodiazepine reduction.
                        </p>
                    </div>
                    
                    <TaperForm onGenerate={handleGeneratePlan} initialValues={{ name: userProfile.name } as any} />
                </div>
                ) : (
                <div className="animate-fade-in-up space-y-8">
                    {/* Header */}
                    <div className="flex flex-col gap-3 mb-4">
                            <h2 className="font-serif text-4xl sm:text-5xl text-slate-100 mt-2 tracking-tight leading-none">
                                {activeTab === 'overview' && 'Home'}
                                {activeTab === 'log' && 'Daily Journal'}
                                {activeTab === 'manual' && 'Reference'}
                                {activeTab === 'settings' && 'Profile'}
                            </h2>
                            <p className="text-slate-400 text-base font-medium">
                                {activeTab === 'overview' && `Welcome back, ${userProfile.name || 'Friend'}.`}
                                {activeTab === 'log' && 'Track symptoms & progress.'}
                                {activeTab === 'manual' && 'Understanding withdrawal.'}
                                {activeTab === 'settings' && 'Manage your account.'}
                            </p>
                    </div>

                    {/* TAB CONTENT: Overview */}
                    {activeTab === 'overview' && (
                    <div className="space-y-8">
                        
                        {/* Mobile Stats Card */}
                        <div className="bg-midnight-800 rounded-3xl p-7 border border-white/5 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col gap-6">
                                    {/* Header Label */}
                                    <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                                        Current Progress <span className="text-slate-600 mx-1">|</span> Days
                                    </h3>

                                    {/* Big Stats Row */}
                                    <div className="flex justify-between items-end">
                                        <span className="text-6xl font-extrabold text-white tracking-tighter leading-none">
                                            {progressPercentage}<span className="text-2xl text-slate-500 ml-1">%</span>
                                        </span>
                                        <span className="text-6xl font-extrabold text-teal-400 tracking-tighter leading-none">
                                            {daysRemaining}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-4 pt-2">
                                        <div className="h-4 bg-midnight-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                            <div 
                                                className="h-full bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(45,212,191,0.2)] relative z-10"
                                                style={{ width: `${Math.max(2, progressPercentage)}%` }}
                                            ></div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                                            <span className="opacity-70">
                                                Start: <span className="text-teal-400">{parseLocalDate(plan.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                            </span>
                                            <span className="text-slate-500">
                                                Goal: <span className="text-teal-400">{(() => {
                                                    const d = parseLocalDate(plan.startDate);
                                                    d.setDate(d.getDate() + totalDays);
                                                    return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                                                })()}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </div>

                        {/* Current Dose Pill */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-midnight-800 rounded-2xl p-6 border border-white/5 shadow-sm">
                                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" /> Daily Target
                                </h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-slate-100 tracking-tight">{currentValiumDose}</span>
                                    <span className="text-xs font-bold text-slate-500">mg</span>
                                </div>
                                <div className="mt-3 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 inline-block px-2.5 py-1 rounded border border-indigo-500/20">Diazepam</div>
                            </div>
                            
                            <div className="bg-midnight-800 rounded-2xl p-6 border border-white/5 shadow-sm flex flex-col justify-between">
                                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Original Med</h4>
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-300 tracking-tight">{currentOriginalDose}</span>
                                        <span className="text-xs font-bold text-slate-600">mg</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-1.5 font-medium">{plan.medication.split('(')[0]}</div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <Card className="rounded-2xl overflow-hidden border-white/5 shadow-sm bg-midnight-800">
                            <CardHeader className="bg-midnight-800 border-none pb-0 pt-6 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                        <TrendingDown className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-100">Reduction Curve</h4>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-4 sm:pt-2">
                                <TaperChart steps={plan.steps} medication={plan.medication} />
                            </CardContent>
                        </Card>

                        {/* Schedule List */}
                        <TaperSchedule 
                            steps={plan.steps} 
                            medication={plan.medication}
                            isDiazepamCrossOver={plan.isDiazepamCrossOver}
                            onToggleDay={handleToggleDay}
                            onAddDay={handleAddDay}
                            logs={logs}
                            startDate={plan.startDate}
                            onAttemptFutureCheck={handleAttemptFutureCheck}
                        />
                    </div>
                    )}

                    {/* TAB CONTENT: Daily Log */}
                    {activeTab === 'log' && (
                        <DailyJournal logs={logs} onSave={handleSaveLog} />
                    )}
                    
                    {/* TAB CONTENT: Manual */}
                    {activeTab === 'manual' && (
                            <ManualReference />
                    )}

                    {/* TAB CONTENT: Settings */}
                    {activeTab === 'settings' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        
                        <ReminderSettings userProfile={userProfile} plan={plan} onUpdateProfile={handleSaveProfile} />

                        <UserProfileEditor />
                        
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-slate-500" />
                                        <h3 className="text-sm font-bold text-slate-200">Plan Configuration</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 bg-midnight-950 rounded-xl border border-white/5 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medication</span>
                                        <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                        {plan.medication.split('(')[0].trim()}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-midnight-950 rounded-xl border border-white/5 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Dose</span>
                                        <div className="font-bold text-slate-200 text-sm">{plan.startDose} mg</div>
                                    </div>
                                    <div className="p-5 bg-midnight-950 rounded-xl border border-white/5 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pace</span>
                                        <div className="font-bold text-slate-200 text-sm">{plan.speed.split('(')[0]}</div>
                                    </div>
                                </div>
                                
                                <div className="pt-8 flex justify-start mt-2">
                                        <Button type="button" variant="outline" onClick={handleResetRequest} className="w-full">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Reconfigure Plan
                                        </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* About & Support Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-slate-500" />
                                        <h3 className="text-sm font-bold text-slate-200">About & Support</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex flex-col divide-y divide-white/5">
                                    <button 
                                        onClick={() => setIsFullDisclaimerOpen(true)}
                                        className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-midnight-950 p-2.5 rounded-lg text-slate-500 group-hover:text-amber-500 transition-colors">
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Legal Disclaimer</div>
                                                <div className="text-xs text-slate-500 font-medium">Read liability & risk info</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                                    </button>
                                    
                                    <a 
                                        href="mailto:support@ashtonpath.com"
                                        className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-midnight-950 p-2.5 rounded-lg text-slate-500 group-hover:text-teal-400 transition-colors">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Help & Support</div>
                                                <div className="text-xs text-slate-500 font-medium">support@ashtonpath.com</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                                    </a>

                                    <a 
                                        href="https://paypal.me/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-midnight-950 p-2.5 rounded-lg text-slate-500 group-hover:text-pink-500 transition-colors">
                                                <Heart className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Donate & Support</div>
                                                <div className="text-xs text-slate-500 font-medium">Support ongoing development</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <div className="flex justify-start pb-8">
                            <Button variant="danger" onClick={handleLogout} className="w-full shadow-md">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                    )}
                </div>
                )}
                </div>
            </main>
        </>
      )}
      </div>
    </div>
  );
};

export default App;
