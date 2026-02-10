import { TaperPlan } from '../types';

export interface MissedDay {
  stepId: string;
  dayIndex: number;
  date: Date;
  stepWeek: number;
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleDateString(undefined, options || { month: 'short', day: 'numeric' });
};

// Parse YYYY-MM-DD to Local Midnight Date to avoid timezone shifts
// This ensures '2025-02-01' is treated as Feb 1st 00:00 local time
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getMissedDays = (plan: TaperPlan): MissedDay[] => {
  if (!plan) return [];
  
  const missed: MissedDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Midnight today

  let currentDate = parseLocalDate(plan.startDate);

  for (const step of plan.steps) {
    for (let i = 0; i < step.completedDays.length; i++) {
      // Create a copy for comparison
      const checkDate = new Date(currentDate);
      
      // If checkDate is strictly before today
      if (checkDate < today) {
         if (!step.completedDays[i]) {
            missed.push({
                stepId: step.id,
                dayIndex: i,
                date: checkDate,
                stepWeek: step.week
            });
         }
      } else {
         // Optimization: steps are sequential. If we hit today, future days can't be "missed" yet.
         return missed;
      }
      
      // Increment
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  return missed;
};

export const shiftSchedule = (plan: TaperPlan, missedDays: MissedDay[]): TaperPlan => {
    if (missedDays.length === 0) return plan;
    
    // We want the first missed day to become Today.
    // So we shift the whole schedule by (Today - FirstMissedDate).
    const firstMissedDate = missedDays[0].date;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Diff in days
    const diffTime = today.getTime() - firstMissedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return plan;

    const oldStart = parseLocalDate(plan.startDate);
    oldStart.setDate(oldStart.getDate() + diffDays);
    
    // Format back to YYYY-MM-DD
    const year = oldStart.getFullYear();
    const month = String(oldStart.getMonth() + 1).padStart(2, '0');
    const day = String(oldStart.getDate()).padStart(2, '0');
    
    return {
        ...plan,
        startDate: `${year}-${month}-${day}`
    };
};