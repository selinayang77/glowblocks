import type { ColorPreset } from '../data/palette';
import { Swatch } from './Swatch';

interface SwatchGridProps {
  presets: ColorPreset[];
  onSelect: (preset: ColorPreset) => void;
}

export function SwatchGrid({ presets, onSelect }: SwatchGridProps) {
  return (
    <div className="swatch-grid">
      {presets.map((p) => (
        <Swatch key={p.id} name={p.name} hex={p.hex} onSelect={() => onSelect(p)} />
      ))}
    </div>
  );
}
