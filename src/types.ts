export interface LightSettings {
  hex: string;
  name: string;
  /** 0.05–1 — scales displayed colour, not hardware brightness. */
  intensity: number;
  /** -1 (cool) to 1 (warm). */
  warmth: number;
}
