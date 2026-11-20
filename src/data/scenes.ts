export interface Scene {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Preset ids from PALETTE, best match first. */
  colorIds: string[];
  /** Suggested starting intensity, 0.05–1. */
  intensity: number;
  /** Suggested warmth, -1 (cool) to 1 (warm). */
  warmth: number;
}

export const SCENES: Scene[] = [
  {
    id: 'selfie',
    name: 'Selfie',
    emoji: '🤳',
    description: 'Soft, flattering front light that evens out skin tone and adds a catchlight to the eyes.',
    colorIds: ['warm-white', 'soft-pink', 'peach'],
    intensity: 1,
    warmth: 0.15,
  },
  {
    id: 'makeup',
    name: 'Makeup',
    emoji: '💄',
    description: 'Neutral, daylight-like light so foundation and lipstick shades look true to life.',
    colorIds: ['cool-white', 'warm-white'],
    intensity: 1,
    warmth: 0,
  },
  {
    id: 'video-call',
    name: 'Video Call',
    emoji: '💻',
    description: 'Gentle warm key light that lifts your face out of shadow without glare on glasses.',
    colorIds: ['warm-white', 'peach'],
    intensity: 0.8,
    warmth: 0.25,
  },
  {
    id: 'product-photo',
    name: 'Product Photo',
    emoji: '📦',
    description: 'Clean white for accurate colour, or a bold hue as a rim light to make objects pop.',
    colorIds: ['cool-white', 'cyan', 'violet'],
    intensity: 1,
    warmth: -0.1,
  },
  {
    id: 'warm-evening',
    name: 'Warm Evening',
    emoji: '🌇',
    description: 'Dim, candle-like glow that is easy on the eyes and sets a cosy mood.',
    colorIds: ['amber', 'orange', 'peach'],
    intensity: 0.45,
    warmth: 0.6,
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    emoji: '🌃',
    description: 'Saturated accent light for moody portraits and creative clips.',
    colorIds: ['rose', 'indigo', 'cyan'],
    intensity: 1,
    warmth: 0,
  },
];
