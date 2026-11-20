export interface RGB {
  r: number;
  g: number;
  b: number;
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** Normalise "abc", "#ABC" or "#aabbcc" to "#AABBCC". Returns null if invalid. */
export function normalizeHex(value: string): string | null {
  const m = value.trim().match(HEX_RE);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return `#${h.toUpperCase()}`;
}

export function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex) ?? '#FFFFFF';
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

export function rgbToCss({ r, g, b }: RGB): string {
  return `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`;
}

/**
 * Apply warmth (-1 cool … +1 warm) and intensity (0–1) to a base colour.
 * Warmth uses channel scaling so whites tint noticeably while saturated
 * colours keep their character. Intensity scales the emitted pixel value —
 * it does NOT change the device's hardware brightness.
 */
export function adjustColor(hex: string, intensity: number, warmth: number): string {
  const { r, g, b } = hexToRgb(hex);
  let rr = r, gg = g, bb = b;
  if (warmth > 0) {
    gg *= 1 - 0.22 * warmth;
    bb *= 1 - 0.6 * warmth;
  } else if (warmth < 0) {
    const c = -warmth;
    rr *= 1 - 0.35 * c;
    gg *= 1 - 0.1 * c;
  }
  const k = Math.max(0, Math.min(1, intensity));
  return rgbToCss({ r: rr * k, g: gg * k, b: bb * k });
}

/** Relative luminance (WCAG) for picking readable label colours. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function readableTextOn(hex: string): string {
  return luminance(hex) > 0.4 ? '#14151a' : '#ffffff';
}
