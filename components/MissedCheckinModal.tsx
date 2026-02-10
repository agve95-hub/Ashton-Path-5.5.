import React from 'react';
import { Modal } from './ui/Modal';
import { MissedDay, formatDate } from '../utils/dateHelpers';
import { CalendarX, CheckCircle2, ArrowRightCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    missedDays: MissedDay[];
    onConfirmTaken: () => void;
    onReschedule: () => void;
}

export const MissedCheckinModal: React.FC<Props> = ({ isOpen, missedDays, onConfirmTaken, onReschedule }) => {
    if (!isOpen || missedDays.length === 0) return null;

    return (
        <Modal isOpen={isOpen} onClose={() => {}} title="Missed Check-ins Detected">
            <div className="p-6 space-y-6">
                <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-5 flex gap-4">
                    <div className="bg-amber-900/30 p-2.5 rounded-full shadow-sm text-amber-500 shrink-0 h-fit">
                        <CalendarX className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-amber-500 text-sm">We noticed some gaps in your log.</h4>
                        <p className="text-sm text-amber-200/70 leading-relaxed">
                            Keeping your schedule accurate is key to a safe taper. Did you take your medication on these days?
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950 rounded-md border border-slate-800 p-4 max-h-48 overflow-y-auto">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Missed Days ({missedDays.length})</h5>
                    <div className="space-y-2">
                        {missedDays.map((day, idx) => (
                            <div key={`${day.stepId}-${day.dayIndex}`} className="flex items-center justify-between bg-slate-900 p-3 rounded-md border border-slate-800 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200 text-sm">
                                            {formatDate(day.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Week {day.stepWeek}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded-md border border-red-900/20">
                                    Missing
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button 
                        onClick={onReschedule}
                        className="flex flex-col items-start p-4 rounded-md border border-slate-700 bg-transparent hover:border-slate-600 hover:bg-slate-800 transition-all text-left group"
                    >
                        <span className="flex items-center gap-2 font-bold text-slate-200 mb-1 group-hover:text-teal-400">
                            <ArrowRightCircle className="w-4 h-4 text-slate-500 group-hover:text-teal-400" />
                            No, I skipped them
                        </span>
                        <span className="text-xs text-slate-500 leading-snug">
                            Shift my schedule forward to resume from today.
                        </span>
                    </button>

                    <button 
                        onClick={onConfirmTaken}
                        className="flex flex-col items-start p-4 rounded-md border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all text-left group"
                    >
                        <span className="flex items-center gap-2 font-bold text-teal-400 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-teal-500" />
                            Yes, I took them
                        </span>
                        <span className="text-xs text-teal-200/70 leading-snug">
                            Mark these days as completed and keep schedule.
                        </span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};