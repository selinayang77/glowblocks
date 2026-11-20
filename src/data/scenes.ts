export interface Scene {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Preset ids from PALETTE, ordered for exploration. */
  colorIds: string[];
  /** Suggested starting intensity, 0.05–1. */
  intensity: number;
  /** Suggested warmth, -1 (cool) to 1 (warm). */
  warmth: number;
}

export const SCENES: Scene[] = [
  {
    id: 'dinner-glow',
    name: 'Dinner Glow',
    emoji: '🕯️',
    description: 'A warm starting point for dinner portraits. Adjust the glow while keeping the room’s atmosphere.',
    colorIds: ['warm-white', 'peach', 'soft-pink'],
    intensity: 0.8,
    warmth: 0,
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    emoji: '🌸',
    description: 'Try a pink tint for a softer mood. Compare the colours in the camera preview.',
    colorIds: ['soft-pink', 'rose', 'peach'],
    intensity: 0.8,
    warmth: 0,
  },
  {
    id: 'cool-mood',
    name: 'Cool Mood',
    emoji: '🌙',
    description: 'Explore cooler tones for a different mood. Start subtle and adjust to your surroundings.',
    colorIds: ['cool-white', 'lavender', 'sky-blue'],
    intensity: 0.8,
    warmth: 0,
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    emoji: '🌃',
    description: 'Try a bold colour for expressive night portraits. Move the light to experiment with shadows.',
    colorIds: ['rose', 'cyan', 'violet'],
    intensity: 1,
    warmth: 0,
  },
];
