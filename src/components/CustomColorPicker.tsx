import { useState } from 'react';
import { normalizeHex, readableTextOn } from '../lib/color';

interface CustomColorPickerProps {
  initialHex: string;
  recent: string[];
  onOpen: (hex: string) => void;
}

export function CustomColorPicker({ initialHex, recent, onOpen }: CustomColorPickerProps) {
  const [hex, setHex] = useState(initialHex);
  const [text, setText] = useState(initialHex);
  const [error, setError] = useState<string | null>(null);

  const commitText = (value: string) => {
    const n = normalizeHex(value);
    if (n) {
      setHex(n);
      setText(n);
      setError(null);
    } else {
      setError('Enter a hex colour like #FFAA33');
    }
  };

  return (
    <div className="custom-picker">
      <div className="custom-picker__row">
        <label className="custom-picker__well" style={{ background: hex }}>
          <span className="sr-only">Choose a colour</span>
          <input
            type="color"
            value={hex.toLowerCase()}
            onChange={(e) => {
              const n = normalizeHex(e.target.value) ?? hex;
              setHex(n);
              setText(n);
              setError(null);
            }}
          />
        </label>

        <div className="custom-picker__field">
          <label htmlFor="hex-input">Hex code</label>
          <input
            id="hex-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            value={text}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'hex-error' : undefined}
            onChange={(e) => {
              setText(e.target.value);
              const n = normalizeHex(e.target.value);
              if (n) {
                setHex(n);
                setError(null);
              }
            }}
            onBlur={(e) => commitText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitText((e.target as HTMLInputElement).value);
            }}
          />
          {error && <p id="hex-error" className="field-error">{error}</p>}
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--block"
        style={{ background: hex, color: readableTextOn(hex) }}
        onClick={() => {
          const n = normalizeHex(text);
          if (!n) return setError('Enter a hex colour like #FFAA33');
          onOpen(n);
        }}
      >
        Open custom light
      </button>

      {recent.length > 0 && (
        <div className="custom-picker__recent">
          <span className="muted">Recent</span>
          <div className="custom-picker__recent-list">
            {recent.map((h) => (
              <button
                key={h}
                type="button"
                className="mini-dot"
                style={{ background: h }}
                aria-label={`Open recent colour ${h}`}
                onClick={() => onOpen(h)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
