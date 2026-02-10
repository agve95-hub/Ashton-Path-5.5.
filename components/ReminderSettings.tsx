
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { TaperPlan, UserProfile } from '../types';
import { Bell, Calendar, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { downloadICS, requestNotificationPermission } from '../utils/reminderService';

interface Props {
    userProfile: UserProfile;
    plan: TaperPlan | null;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const ReminderSettings: React.FC<Props> = ({ userProfile, plan, onUpdateProfile }) => {
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
    const [timeValue, setTimeValue] = useState(userProfile.notificationTime || '09:00');

    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        setPermissionStatus(Notification.permission);
        if (granted) {
            onUpdateProfile({ 
                ...userProfile, 
                notificationsEnabled: true,
                notificationTime: timeValue 
            });
        }
    };

    const handleDisableNotifications = () => {
        onUpdateProfile({ ...userProfile, notificationsEnabled: false });
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setTimeValue(newTime);
        if (userProfile.notificationsEnabled) {
            onUpdateProfile({ ...userProfile, notificationTime: newTime });
        }
    };

    const handleExportCalendar = () => {
        if (plan) {
            downloadICS(plan);
        }
    };

    return (
        <div className="space-y-6">
            {/* Calendar Export Section */}
            <Card className="bg-gradient-to-br from-indigo-950/40 to-midnight-800 border-indigo-500/20 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
                <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-base">External Calendar</h3>
                            <p className="text-xs text-slate-400">Sync with Apple, Google, or Outlook</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                        Download your full tapering schedule as an <strong>.ics</strong> file. This creates all-day events for every dose reduction, so you never miss a step change even if you're offline.
                    </p>
                    <Button 
                        onClick={handleExportCalendar} 
                        disabled={!plan}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Schedule to Calendar
                    </Button>
                </CardContent>
            </Card>

            {/* Browser Notification Section */}
            <Card className="bg-midnight-800 border-white/5">
                 <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-base">Daily Check-in</h3>
                            <p className="text-xs text-slate-400">Browser reminders to log symptoms</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    <div className="flex items-center justify-between">
                         <div className="space-y-1">
                             <label className="text-sm font-bold text-slate-200">Enable Notifications</label>
                             <div className="text-xs text-slate-500">Requires browser permission</div>
                         </div>
                         
                         {userProfile.notificationsEnabled ? (
                             <button 
                                onClick={handleDisableNotifications}
                                className="bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all hover:bg-teal-400"
                             >
                                 Enabled
                             </button>
                         ) : (
                             <button 
                                onClick={handleEnableNotifications}
                                className="bg-midnight-950 text-slate-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-midnight-900 transition-all hover:text-slate-200"
                             >
                                 Disabled
                             </button>
                         )}
                    </div>

                    {userProfile.notificationsEnabled && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-300 pt-4 border-t border-white/5">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Reminder Time</label>
                             <div className="relative">
                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-500">
                                     <Clock className="w-4 h-4" />
                                 </div>
                                 <input 
                                    type="time" 
                                    value={timeValue}
                                    onChange={handleTimeChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-midnight-950 border border-teal-500/30 rounded-xl text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                                 />
                             </div>
                             <div className="mt-4 flex gap-3 p-3 bg-teal-500/5 border border-teal-500/10 rounded-lg">
                                 <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                 <p className="text-xs text-slate-400 leading-snug">
                                     You will receive a notification at <strong>{timeValue}</strong> daily if this tab is open or your browser allows background processes.
                                 </p>
                             </div>
                        </div>
                    )}
                    
                    {permissionStatus === 'denied' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 items-start">
                             <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                             <p className="text-xs text-red-300 leading-snug">
                                 Notifications are blocked in your browser settings. You must manually enable them for this site to receive reminders.
                             </p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
};
