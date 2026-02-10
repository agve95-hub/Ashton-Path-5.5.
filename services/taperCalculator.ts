import { BenzoType, TaperPlan, TaperSpeed, TaperStep, Metabolism } from '../types';
import { BENZO_DETAILS } from '../constants';

// --- ROUNDING LOGIC ---

/**
 * rounds a dose to the nearest increment based on the physical form of the medication.
 */
const roundToPillSize = (dose: number, medication: BenzoType): number => {
    if (dose <= 0) return 0;

    let increment = 0.125; // Default for high potency (Xanax/Klonopin 0.5mg -> 1/4 is 0.125)

    switch (medication) {
        case BenzoType.DIAZEPAM:
            // Valium: 2mg tabs. Practical limit is 1/4 tab (0.5mg).
            increment = 0.5;
            break;
        case BenzoType.CHLORDIAZEPOXIDE:
            // Librium: 5mg capsules. Hard to split. 
            // We'll assume opening and halving is the max effort (2.5mg).
            // Anything less than 1.25mg (half of half) is likely too hard to measure accurately without a scale.
            increment = 1.25; 
            break;
        case BenzoType.TEMAZEPAM:
            // Temazepam: 15mg capsules usually. Hard to split.
            increment = 5; 
            break;
        case BenzoType.LORAZEPAM:
            // Ativan: 0.5mg or 1mg tabs. 
            increment = 0.25;
            break;
        case BenzoType.ALPRAZOLAM:
        case BenzoType.CLONAZEPAM:
        default:
            // Xanax/Klonopin: 0.5mg tabs. 1/4 is 0.125mg.
            increment = 0.125;
            break;
    }

    const rounded = Math.round(dose / increment) * increment;
    
    // JS floating point fix (e.g. 0.1 + 0.2 !== 0.3)
    return Math.round(rounded * 1000) / 1000;
};

export const calculateTaperSchedule = (
  medication: BenzoType,
  startDose: number,
  speed: TaperSpeed,
  age: number,
  metabolism: Metabolism,
  yearsUsing: number,
  startDate: string,
  targetEndDate?: string
): TaperPlan => {
  const details = BENZO_DETAILS[medication];
  const isDirectTaper = medication === BenzoType.DIAZEPAM;

  // Initial Rounding
  const currentTotalDose = roundToPillSize(startDose, medication);

  const steps: TaperStep[] = [];
  
  let currentValiumTotal = isDirectTaper ? currentTotalDose : 0;
  let currentOriginalTotal = isDirectTaper ? 0 : currentTotalDose;
  
  let weekCount = 0;
  let stepCounter = 0;
  let globalDayCounter = 1;

  // --- DETERMINE BASELINE DURATION ---
  let baseStepDuration = 7; 
  if (speed === TaperSpeed.SLOW) {
      baseStepDuration = 14;
  } else if (age > 65 || metabolism === 'slow') {
      baseStepDuration = 14; 
  }

  const addStep = (phase: any, notes?: string) => {
      // Apply strict rounding for display/schedule
      const dispOriginal = isDirectTaper ? 0 : roundToPillSize(currentOriginalTotal, medication);
      const dispValium = roundToPillSize(currentValiumTotal, BenzoType.DIAZEPAM);
      
      // Filter out tiny dust amounts that result from math
      const finalOriginal = dispOriginal < 0.1 ? 0 : dispOriginal;
      const finalValium = dispValium < 0.2 ? 0 : dispValium;

      if (finalOriginal === 0 && finalValium === 0 && phase !== 'jump') {
          // Prevent generating an empty step unless it's the jump
          return;
      }

      steps.push({
        id: `step-${++stepCounter}`,
        week: Math.floor(weekCount) + 1,
        phase,
        schedule: {
            original: finalOriginal,
            diazepam: finalValium
        },
        originalMedDose: finalOriginal,
        diazepamDose: finalValium,
        totalDiazepamEq: Math.round((finalOriginal * details.diazepamEquivalence + finalValium) * 100) / 100,
        isCompleted: false,
        completedDays: new Array(baseStepDuration).fill(false),
        durationDays: baseStepDuration,
        globalDayStart: globalDayCounter,
        notes
      });
      globalDayCounter += baseStepDuration;
      weekCount += (baseStepDuration / 7);
  };

  // --- STAGE 1: CROSSOVER (If not Diazepam) ---
  if (!isDirectTaper && currentOriginalTotal > 0) {
      const totalValiumEq = currentOriginalTotal * details.diazepamEquivalence;
      const originalBaseline = currentOriginalTotal;

      // Step 1: 75% Original, 25% Valium
      currentOriginalTotal = originalBaseline * 0.75;
      currentValiumTotal = totalValiumEq * 0.25;
      addStep('crossover', `Substitute approx. 25% of ${details.name} with Diazepam.`);

      // Step 2: 50% Original, 50% Valium
      currentOriginalTotal = originalBaseline * 0.50;
      currentValiumTotal = totalValiumEq * 0.50;
      addStep('crossover', `Substitute another 25% (Halfway point).`);

      // Step 3: 25% Original, 75% Valium
      currentOriginalTotal = originalBaseline * 0.25;
      currentValiumTotal = totalValiumEq * 0.75;
      
      // Special Check: If the remaining original dose is tiny (e.g. < 1mg Librium), just drop it now
      if (roundToPillSize(currentOriginalTotal, medication) === 0) {
          currentOriginalTotal = 0;
          currentValiumTotal = totalValiumEq; // Full switch early if dose is tiny
          addStep('crossover', `Remaining ${details.name} dose is too small to split. Switched to Diazepam.`);
      } else {
          addStep('crossover', `Substitute another 25%. Mostly Diazepam now.`);
      }

      // Step 4: Full Switch
      if (currentOriginalTotal > 0) {
        currentOriginalTotal = 0;
        currentValiumTotal = totalValiumEq;
        addStep('stabilize', 'Full substitution complete. Stabilize.');
      }
  } else {
      addStep('stabilize', 'Stabilize on starting dose.');
  }

  // --- STAGE 2: REDUCTION ---
  
  let customWeeklyReduction = 0;
  if (speed === TaperSpeed.CUSTOM && targetEndDate) {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (globalDayCounter - 1));
    const end = new Date(targetEndDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const weeks = totalDays / 7;
    customWeeklyReduction = currentValiumTotal / weeks;
  }

  let safetyValve = 0;
  
  while (currentValiumTotal > 0 && safetyValve < 150) {
    safetyValve++;
    
    // Determine reduction amount
    let reductionAmount = 0;

    if (speed === TaperSpeed.CUSTOM) {
        reductionAmount = customWeeklyReduction;
    } else if (speed === TaperSpeed.ASHTON) {
        // STRICT ASHTON SCHEDULE
        if (currentValiumTotal >= 50) reductionAmount = 5;
        else if (currentValiumTotal >= 20) reductionAmount = 2;
        else if (currentValiumTotal >= 10) reductionAmount = 1;
        else if (currentValiumTotal >= 5) reductionAmount = 0.5;
        else reductionAmount = 0.5; 
    } else if (speed === TaperSpeed.MODERATE) {
        reductionAmount = currentValiumTotal * 0.10;
        if (reductionAmount < 0.5) reductionAmount = 0.5; // Minimum cut 0.5mg
    } else {
        // SLOW
        reductionAmount = currentValiumTotal * 0.05;
        if (reductionAmount < 0.5) reductionAmount = 0.5; // Minimum cut 0.5mg
    }

    let nextTotal = currentValiumTotal - reductionAmount;
    
    // ROUNDING ENFORCEMENT for Valium Steps
    let roundedNext = roundToPillSize(nextTotal, BenzoType.DIAZEPAM);
    
    // Prevent Stagnation
    if (roundedNext >= currentValiumTotal) {
        roundedNext = currentValiumTotal - 0.5;
    }

    // Jumping off point
    if (nextTotal <= 0.25) { 
      roundedNext = 0;
    }

    if (roundedNext < 0) roundedNext = 0;

    // Check if we already have a step with this exact dose (to prevent duplicates if math gets stuck)
    const lastStep = steps[steps.length - 1];
    if (lastStep && lastStep.diazepamDose === roundedNext && lastStep.originalMedDose === 0) {
       // Force a drop if stuck
       roundedNext = Math.max(0, roundedNext - 0.5);
    }

    currentValiumTotal = roundedNext;
    
    addStep(currentValiumTotal === 0 ? 'jump' : 'reduction', currentValiumTotal === 0 ? 'Completion' : undefined);
    
    if (currentValiumTotal === 0) break;
  }

  return {
    medication,
    startDose,
    startDate,
    speed,
    age,
    metabolism,
    yearsUsing,
    steps,
    isDiazepamCrossOver: !isDirectTaper
  };
};