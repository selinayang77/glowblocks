import { readableTextOn } from '../lib/color';

interface SwatchProps {
  name: string;
  hex: string;
  onSelect: () => void;
  size?: 'large' | 'small';
}

export function Swatch({ name, hex, onSelect, size = 'large' }: SwatchProps) {
  return (
    <button
      type="button"
      className={`swatch swatch--${size}`}
      style={{ background: hex, color: readableTextOn(hex) }}
      onClick={onSelect}
      aria-label={`Open ${name} light`}
    >
      <span className="swatch__name">{name}</span>
      {size === 'large' && <span className="swatch__hex">{hex}</span>}
    </button>
  );
}
