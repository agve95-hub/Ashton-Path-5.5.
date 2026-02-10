
import { DailyLogEntry } from './types';

export const generateMockHistory = (): DailyLogEntry[] => {
  const history: DailyLogEntry[] = [];
  const today = new Date();
  
  // Generate 50 days of data
  for (let i = 50; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate a recovery curve with some random fluctuations (windows and waves)
    // As days go by (i decreases), symptoms generally improve
    const progress = (50 - i) / 50; // 0 to 1
    
    // Base volatility
    const isWave = Math.random() > 0.8; // 20% chance of a "wave" (bad day)
    
    let stress = Math.max(1, Math.round(8 - (progress * 5) + (Math.random() * 2)));
    let sleep = Math.min(9, Math.round(4 + (progress * 4) + (Math.random() * 1)));
    
    if (isWave) {
        stress = Math.min(10, stress + 3);
        sleep = Math.max(2, sleep - 3);
    }

    history.push({
      date: dateStr,
      stress,
      tremors: isWave ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 2),
      dizziness: Math.floor(Math.random() * 3),
      musclePain: Math.floor(Math.random() * 3),
      nausea: 0,
      irritability: Math.floor(Math.random() * 4),
      depersonalization: isWave ? 4 : 0,
      sensorySensitivity: isWave ? 3 : 0,
      tinnitus: 0,
      sleepQuality: sleep,
      sleepHours: sleep > 6 ? 7.5 : 5,
      napped: sleep < 5,
      restlessSleep: sleep < 5,
      medications: 'Diazepam',
      activities: i % 2 === 0 ? ['Walking', 'Reading'] : ['Meditation'],
      notes: isWave ? "Feeling a bit rough today." : "Steady day, feeling better."
    });
  }

  return history;
};
