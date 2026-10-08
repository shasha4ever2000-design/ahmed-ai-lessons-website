// A light tap of vibration for meaningful moments only (Android phones; elsewhere nothing happens).
// Fired on the same frame as the visual change, never for routine taps.
const PATTERNS = { success: [12, 60, 18], select: 8, complete: 14 } as const;

export function haptic(kind: keyof typeof PATTERNS) {
  try { (navigator as Navigator & { vibrate?: (p: number | readonly number[]) => boolean }).vibrate?.(PATTERNS[kind] as number | number[]); } catch { /* not allowed here */ }
}
