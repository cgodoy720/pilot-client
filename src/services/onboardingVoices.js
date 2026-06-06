// Client copy of the onboarding voice catalog. Must stay in sync with
// test-pilot-server/services/onboardingVoices.js — server validates incoming
// voiceId against its own allowlist before passing it to the agent worker.

export const ONBOARDING_VOICES = [
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', gender: 'female',  description: 'Playful, bright, warm. American, young, conversational.' },
  { id: 'hpp4J3VqNfWAUOO0d1Us', name: 'Bella',   gender: 'female',  description: 'Professional, bright, warm. American, middle-aged.' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River',   gender: 'neutral', description: 'Relaxed, neutral, informative. American, middle-aged, calm.' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will',    gender: 'male',    description: 'Relaxed optimist. American, young, chill.' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam',    gender: 'male',    description: 'Energetic social-media creator. American, young.' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian',   gender: 'male',    description: 'Deep, resonant, comforting. American, middle-aged.' },
];

export const DEFAULT_VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us'; // Bella
