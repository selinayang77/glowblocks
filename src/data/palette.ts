export type ColorFamily = 'warm' | 'cool' | 'neutral' | 'creative';

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  family: ColorFamily;
}

/** The 18 built-in light colours, ordered for a pleasing grid. */
export const PALETTE: ColorPreset[] = [
  { id: 'warm-white', name: 'Warm White', hex: '#FFE4C2', family: 'neutral' },
  { id: 'cool-white', name: 'Cool White', hex: '#EEF5FF', family: 'neutral' },
  { id: 'peach', name: 'Peach', hex: '#FFC4A3', family: 'warm' },
  { id: 'soft-pink', name: 'Soft Pink', hex: '#FFC9DA', family: 'warm' },
  { id: 'rose', name: 'Rose', hex: '#FF6F96', family: 'warm' },
  { id: 'red', name: 'Red', hex: '#FF3B30', family: 'warm' },
  { id: 'orange', name: 'Orange', hex: '#FF8A1F', family: 'warm' },
  { id: 'amber', name: 'Amber', hex: '#FFB627', family: 'warm' },
  { id: 'yellow', name: 'Yellow', hex: '#FFE53D', family: 'warm' },
  { id: 'lime', name: 'Lime', hex: '#B9F23C', family: 'creative' },
  { id: 'green', name: 'Green', hex: '#34C759', family: 'creative' },
  { id: 'mint', name: 'Mint', hex: '#9FF5D0', family: 'cool' },
  { id: 'cyan', name: 'Cyan', hex: '#2FE3F0', family: 'cool' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#7CC7FF', family: 'cool' },
  { id: 'blue', name: 'Blue', hex: '#2F6BFF', family: 'cool' },
  { id: 'indigo', name: 'Indigo', hex: '#5B4BFF', family: 'creative' },
  { id: 'violet', name: 'Violet', hex: '#A64DFF', family: 'creative' },
  { id: 'lavender', name: 'Lavender', hex: '#CDB8FF', family: 'creative' },
];

export function findPreset(id: string): ColorPreset | undefined {
  return PALETTE.find((p) => p.id === id);
}
