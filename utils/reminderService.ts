
import { TaperPlan, TaperStep } from '../types';
import { addDays, formatDate } from './dateHelpers';

// --- ICS CALENDAR GENERATION ---

export const generateICSFile = (plan: TaperPlan) => {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AshtonPath//Taper Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];

    const now = new Date();
    const dtStamp = now.toISOString().replace(/[-:.]/g, '').split('T')[0] + 'T000000Z';
    const planStart = new Date(plan.startDate);

    let currentDayOffset = 0;

    plan.steps.forEach((step, index) => {
        // We create an event for the START of every new phase/step
        const stepDate = addDays(planStart, currentDayOffset);
        
        // Format date for ICS (YYYYMMDD)
        const dtStart = stepDate.toISOString().replace(/[-:.]/g, '').split('T')[0];
        // Event lasts 1 day (All day event)
        const dtEnd = addDays(stepDate, 1).toISOString().replace(/[-:.]/g, '').split('T')[0];

        const medName = plan.medication.split('(')[0].trim();
        const description = `
Ashton Path Step ${step.week}
------------------------
Target Dose:
${step.schedule.diazepam > 0 ? `• Diazepam: ${step.schedule.diazepam}mg` : ''}
${step.schedule.original > 0 ? `• ${medName}: ${step.schedule.original}mg` : ''}
${step.schedule.original === 0 && step.schedule.diazepam === 0 ? '• Jump / Freedom' : ''}

${step.notes ? `Note: ${step.notes}` : ''}
        `.trim();

        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${step.id}-${dtStamp}-ashtonpath`,
            `DTSTAMP:${dtStamp}`,
            `DTSTART;VALUE=DATE:${dtStart}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            `SUMMARY:Ashton Taper: Week ${step.week} (${step.schedule.diazepam}mg Valium)`,
            `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT', // Does not block time as "Busy"
            'END:VEVENT'
        );

        currentDayOffset += step.durationDays;
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
};

export const downloadICS = (plan: TaperPlan) => {
    const content = generateICSFile(plan);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `ashton-taper-schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- BROWSER NOTIFICATIONS ---

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/icon-192.png', // Fallback if exists
            tag: 'ashton-daily-checkin'
        });
    }
};
