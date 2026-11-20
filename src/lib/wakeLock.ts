interface WakeLockSentinelLike {
  release: () => Promise<void>;
}
type NavWithWakeLock = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
};

/**
 * Keeps the screen awake while active, re-acquiring after the tab becomes
 * visible again. Silently does nothing where the Screen Wake Lock API is
 * unavailable or denied. Returns a cleanup function.
 */
export function keepScreenAwake(): () => void {
  const nav = navigator as NavWithWakeLock;
  if (!nav.wakeLock) return () => {};

  let sentinel: WakeLockSentinelLike | null = null;
  let active = true;

  const acquire = async () => {
    if (!active || document.visibilityState !== 'visible') return;
    try {
      sentinel = await nav.wakeLock!.request('screen');
    } catch {
      sentinel = null;
    }
  };
  const onVisibility = () => void acquire();

  void acquire();
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    active = false;
    document.removeEventListener('visibilitychange', onVisibility);
    sentinel?.release().catch(() => {});
    sentinel = null;
  };
}
