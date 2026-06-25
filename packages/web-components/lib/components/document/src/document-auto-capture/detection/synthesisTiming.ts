export const SYNTH_BRIDGE_WINDOW_MS = 500;

export function isSyntheticBridgeRecent(
  lastRealCardAtMs: number | null,
  nowMs: number,
): boolean {
  if (lastRealCardAtMs == null) return false;
  const elapsedMs = nowMs - lastRealCardAtMs;
  return elapsedMs >= 0 && elapsedMs <= SYNTH_BRIDGE_WINDOW_MS;
}