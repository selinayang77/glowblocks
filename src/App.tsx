import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTE, type ColorPreset } from './data/palette';
import { SCENES, type Scene } from './data/scenes';
import type { LightSettings } from './types';
import { enterFullscreen, exitFullscreen, isFullscreenActive, isFullscreenSupported } from './lib/fullscreen';
import { loadJSON, saveJSON } from './lib/storage';
import { SwatchGrid } from './components/SwatchGrid';
import { SceneCard } from './components/SceneCard';
import { CustomColorPicker } from './components/CustomColorPicker';
import { LightView } from './components/LightView';

const RECENT_KEY = 'glowblocks:recent-custom';
const MAX_RECENT = 8;
const HISTORY_MARK = 'glowblocks-light';

export default function App() {
  const [light, setLight] = useState<LightSettings | null>(null);
  // null = request pending, so the "no fullscreen" hint doesn't flash while the browser decides.
  const [fullscreen, setFullscreen] = useState<boolean | null>(null);
  const [recent, setRecent] = useState<string[]>(() => {
    const v = loadJSON<unknown>(RECENT_KEY, []);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECENT) : [];
  });
  const lastLight = useRef<LightSettings | null>(null);

  const open = useCallback((settings: LightSettings) => {
    setLight(settings);
    lastLight.current = settings;
    setFullscreen(isFullscreenSupported() ? null : false);
    // Push a history entry so the phone's back gesture closes the light.
    try {
      window.history.pushState({ [HISTORY_MARK]: true }, '');
    } catch {
      /* ignore */
    }
    // Called synchronously inside the tap handler so browsers accept it as a user gesture.
    if (isFullscreenSupported()) {
      void enterFullscreen().then(setFullscreen);
    }
  }, []);

  const closeInternal = useCallback(() => {
    setLight(null);
    void exitFullscreen();
  }, []);

  const close = useCallback(() => {
    if (window.history.state?.[HISTORY_MARK]) window.history.back(); // triggers popstate → closeInternal
    else closeInternal();
  }, [closeInternal]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(isFullscreenActive());
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    const onPop = () => closeInternal();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeInternal]);

  const openPreset = (p: ColorPreset) => open({ hex: p.hex, name: p.name, intensity: 1, warmth: 0 });

  const openScene = (p: ColorPreset, s: Scene) =>
    open({ hex: p.hex, name: `${s.name} · ${p.name}`, intensity: s.intensity, warmth: s.warmth });

  const openCustom = (hex: string) => {
    const next = [hex, ...recent.filter((h) => h !== hex)].slice(0, MAX_RECENT);
    setRecent(next);
    saveJSON(RECENT_KEY, next);
    open({ hex, name: `Custom ${hex}`, intensity: 1, warmth: 0 });
  };

  if (light) {
    return (
      <LightView
        initial={light}
        fullscreen={fullscreen}
        onChange={(s) => (lastLight.current = s)}
        onClose={close}
      />
    );
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="logo" aria-hidden="true">
          <span style={{ background: '#FFE4C2' }} />
          <span style={{ background: '#7CC7FF' }} />
          <span style={{ background: '#FF6F96' }} />
          <span style={{ background: '#B9F23C' }} />
        </div>
        <div>
          <p className="app__brand">GlowBlocks</p>
          <h1>Your screen. Your light. Your mood.</h1>
          <p className="app__intro muted">
            Find your light for dinner photos, late-night selfies and low-light portraits. Pick a colour, adjust the glow, and open the selfie camera—or light a shot taken on another device.
          </p>
        </div>
      </header>

      {lastLight.current && (
        <button type="button" className="resume" onClick={() => open(lastLight.current!)}>
          <span className="resume__dot" style={{ background: lastLight.current.hex }} />
          <span>
            Resume <strong>{lastLight.current.name}</strong>
          </span>
        </button>
      )}

      <section aria-labelledby="scenes-h">
        <h2 id="scenes-h" className="section-title">Find your mood</h2>
        <div className="scene-grid">
          {SCENES.map((s) => (
            <SceneCard key={s.id} scene={s} onSelect={openScene} />
          ))}
        </div>
        <p className="scene-note muted">
          Starting points, not fixed rules—your screen, surroundings and camera all affect the result.
        </p>
      </section>

      <section aria-labelledby="colours-h">
        <h2 id="colours-h" className="section-title">Explore all colours</h2>
        <SwatchGrid presets={PALETTE} onSelect={openPreset} />
      </section>

      <section aria-labelledby="custom-h">
        <h2 id="custom-h" className="section-title">Make it yours</h2>
        <CustomColorPicker initialHex={recent[0] ?? '#FFB6A0'} recent={recent} onOpen={openCustom} />
      </section>

      <section aria-labelledby="shoot-h">
        <h2 id="shoot-h" className="section-title">Two ways to shoot</h2>
        <div className="shoot-grid">
          <article className="shoot-tip">
            <h3>Selfie with your glow</h3>
            <p>Choose a colour, tap Camera, and frame your shot. The screen around the preview provides the light.</p>
          </article>
          <article className="shoot-tip">
            <h3>Light another camera</h3>
            <p>Keep GlowBlocks open on one device and take the photo with another. Try moving the light closer or changing its angle.</p>
          </article>
        </div>
      </section>

      <footer className="app__footer muted">
        For a stronger glow, raise your device’s screen brightness. The intensity slider adjusts the displayed colour, not your device’s brightness setting.
      </footer>
    </div>
  );
}
