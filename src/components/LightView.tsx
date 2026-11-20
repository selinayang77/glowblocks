import { useEffect, useMemo, useState } from 'react';
import type { LightSettings } from '../types';
import { PALETTE } from '../data/palette';
import { adjustColor } from '../lib/color';
import { keepScreenAwake } from '../lib/wakeLock';
import { Slider } from './Slider';
import { CameraPanel } from './CameraPanel';

interface LightViewProps {
  initial: LightSettings;
  /** null while the fullscreen request is still pending. */
  fullscreen: boolean | null;
  onChange: (s: LightSettings) => void;
  onClose: () => void;
}

const HINT_MS = 4500;

function warmthLabel(w: number): string {
  if (Math.abs(w) < 0.05) return 'Neutral';
  return `${w > 0 ? 'Warmer' : 'Cooler'} ${Math.round(Math.abs(w) * 100)}%`;
}

export function LightView({ initial, fullscreen, onChange, onClose }: LightViewProps) {
  const [settings, setSettings] = useState<LightSettings>(initial);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hintVisible, setHintVisible] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);

  const update = (patch: Partial<LightSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      onChange(next);
      return next;
    });
  };

  const displayColor = useMemo(
    () => adjustColor(settings.hex, settings.intensity, settings.warmth),
    [settings.hex, settings.intensity, settings.warmth],
  );

  useEffect(() => keepScreenAwake(), []);

  useEffect(() => {
    const t = window.setTimeout(() => setHintVisible(false), HINT_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (cameraOn) setCameraOn(false);
        else onClose();
      } else if (cameraOn) {
        return;
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setControlsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, cameraOn]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className={`light ${controlsVisible && !cameraOn ? '' : 'light--clean'} ${cameraOn ? 'light--camera' : ''}`}
      style={{ background: displayColor }}
      onClick={() => !cameraOn && setControlsVisible((v) => !v)}
      role="application"
      aria-label={`${settings.name} light. Tap to ${controlsVisible ? 'hide' : 'show'} controls.`}
    >
      {cameraOn && (
        <CameraPanel
          intensity={settings.intensity}
          onIntensityChange={(v) => update({ intensity: v })}
          onClose={() => setCameraOn(false)}
        />
      )}

      {!cameraOn && (
        <button
          type="button"
          className="light__camera"
          onClick={(e) => {
            stop(e);
            setCameraOn(true);
            setHintVisible(false);
          }}
          aria-label="Open camera to take a photo with this light"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M4 8h3l2-3h6l2 3h3v11H4z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Camera</span>
        </button>
      )}

      <button
        hidden={cameraOn}
        type="button"
        className="light__close"
        onClick={(e) => {
          stop(e);
          onClose();
        }}
        aria-label="Close light and return to colours"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span>Close</span>
      </button>

      {hintVisible && !cameraOn && (
        <div className="light__hint" role="status" onClick={stop}>
          <strong>Tip:</strong> turn your device brightness up for a stronger light.
          {fullscreen === false && <> Full-screen isn't available here, so the light fills the window instead.</>}
          <br />
          <span className="muted">Tap anywhere to show or hide controls.</span>
        </div>
      )}

      <section
        className="light__panel"
        aria-label="Light controls"
        aria-hidden={!controlsVisible || cameraOn}
        hidden={cameraOn}
        onClick={stop}
      >
        <div className="light__title">
          <span className="light__dot" style={{ background: displayColor }} />
          <h2>{settings.name}</h2>
        </div>

        <Slider
          id="intensity"
          label="Intensity"
          min={0.05}
          max={1}
          step={0.01}
          value={settings.intensity}
          valueText={`${Math.round(settings.intensity * 100)}%`}
          onChange={(v) => update({ intensity: v })}
        />
        <p className="light__note">
          Dims the on-screen colour. It can't change your phone's brightness setting.
        </p>

        <Slider
          id="warmth"
          label="Warmth"
          min={-1}
          max={1}
          step={0.01}
          value={settings.warmth}
          valueText={warmthLabel(settings.warmth)}
          trackBackground="linear-gradient(90deg, #9ec5ff, #f2f2f2 50%, #ffb066)"
          onChange={(v) => update({ warmth: Math.abs(v) < 0.04 ? 0 : v })}
        />

        <div className="light__quick" role="group" aria-label="Switch colour">
          {PALETTE.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`mini-dot ${p.hex === settings.hex ? 'is-active' : ''}`}
              style={{ background: p.hex }}
              aria-label={`Switch to ${p.name}`}
              aria-pressed={p.hex === settings.hex}
              onClick={() => update({ hex: p.hex, name: p.name })}
            />
          ))}
        </div>

        <div className="light__actions">
          <button type="button" className="btn btn--ghost" onClick={() => update({ intensity: 1, warmth: 0 })}>
            Reset
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setControlsVisible(false)}>
            Hide controls
          </button>
        </div>
      </section>
    </div>
  );
}
