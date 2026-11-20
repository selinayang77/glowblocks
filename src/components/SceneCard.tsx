import type { Scene } from '../data/scenes';
import { findPreset, type ColorPreset } from '../data/palette';
import { readableTextOn } from '../lib/color';

interface SceneCardProps {
  scene: Scene;
  onSelect: (preset: ColorPreset, scene: Scene) => void;
}

export function SceneCard({ scene, onSelect }: SceneCardProps) {
  const presets = scene.colorIds
    .map(findPreset)
    .filter((p): p is ColorPreset => Boolean(p));

  return (
    <article className="scene-card">
      <header className="scene-card__head">
        <span className="scene-card__emoji" aria-hidden="true">{scene.emoji}</span>
        <h3>{scene.name}</h3>
      </header>
      <p className="scene-card__desc">{scene.description}</p>
      <div className="scene-card__chips">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            style={{ background: p.hex, color: readableTextOn(p.hex) }}
            onClick={() => onSelect(p, scene)}
            aria-label={`Open ${p.name} light for ${scene.name}`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </article>
  );
}
