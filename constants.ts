import { BenzoType, BenzoData } from './types';

// Approximate equivalents to 10mg Diazepam according to Ashton
export const BENZO_DETAILS: Record<BenzoType, BenzoData> = {
  [BenzoType.ALPRAZOLAM]: {
    name: 'Alprazolam',
    halfLife: '6-12 hrs',
    diazepamEquivalence: 20 // 0.5mg Xanax ~= 10mg Valium -> 1mg Xanax = 20mg Valium
  },
  [BenzoType.CLONAZEPAM]: {
    name: 'Clonazepam',
    halfLife: '18-50 hrs',
    diazepamEquivalence: 20 // 0.5mg Klonopin ~= 10mg Valium -> 1mg Klonopin = 20mg Valium
  },
  [BenzoType.DIAZEPAM]: {
    name: 'Diazepam',
    halfLife: '20-100 hrs',
    diazepamEquivalence: 1 // 1:1
  },
  [BenzoType.LORAZEPAM]: {
    name: 'Lorazepam',
    halfLife: '10-20 hrs',
    diazepamEquivalence: 10 // 1mg Ativan ~= 10mg Valium
  },
  [BenzoType.TEMAZEPAM]: {
    name: 'Temazepam',
    halfLife: '8-22 hrs',
    diazepamEquivalence: 0.5 // 20mg Temazepam ~= 10mg Valium -> 1mg Temazepam = 0.5mg Valium
  },
  [BenzoType.CHLORDIAZEPOXIDE]: {
    name: 'Chlordiazepoxide',
    halfLife: '5-30 hrs',
    diazepamEquivalence: 0.4 // 25mg Librium ~= 10mg Valium -> 1mg Librium = 0.4mg Valium
  }
};

export const ASHTON_SYMPTOMS = [
  {
    category: 'Psychological',
    name: 'Depersonalization',
    description: 'A feeling of being detached from one’s body or unreal. Ashton explains this is a protective mechanism of the brain during over-stimulation. It is not a sign of psychosis and resolves completely upon recovery.'
  },
  {
    category: 'Sensory',
    name: 'Tinnitus',
    description: 'Ringing, buzzing, or hissing in the ears. Caused by hypersensitivity of the auditory centers in the brain. Ashton notes this can persist but eventually fades.'
  },
  {
    category: 'Physical',
    name: 'Benzo Belly',
    description: 'Gastrointestinal disturbances (pain, bloating, nausea). The gut has more GABA receptors than the brain; withdrawal often disrupts digestion heavily.'
  },
  {
    category: 'Physical',
    name: 'Muscle Spasms',
    description: 'Jerks, tremors, or shaking. Benzodiazepines are potent muscle relaxants; removing them causes rebound muscle tension.'
  },
  {
    category: 'Psychological',
    name: 'Rebound Anxiety',
    description: 'Anxiety that is stronger than the original baseline. This is a physiological reaction to the lack of GABA inhibition, not necessarily a return of the underlying condition.'
  },
  {
    category: 'Sensory',
    name: 'Hypersensitivity',
    description: 'Extreme sensitivity to light, sound, taste, and smell. Ordinary stimuli can feel overwhelming due to the lack of the brain\'s "filtering" mechanism.'
  },
  {
    category: 'Physical',
    name: 'Formication',
    description: 'A sensation of insects crawling on or under the skin. A type of paresthesia caused by nerve hypersensitivity.'
  },
  {
    category: 'Psychological',
    name: 'Insomnia',
    description: 'Difficulty falling or staying asleep. Sleep patterns often take weeks or months to normalize as the brain relearns natural sleep regulation.'
  },
  {
    category: 'Physical',
    name: 'Heart Palpitations',
    description: 'Pounding heart or racing pulse. A result of the overactive sympathetic nervous system (fight or flight response) during withdrawal.'
  }
];