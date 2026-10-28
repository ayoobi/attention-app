import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_DURATION_MIN } from '../constants';

export type TimerPhase = 'idle' | 'running' | 'paused' | 'distracted' | 'done';

type Options = {
  facePresent: boolean;
  monitoring: boolean;
  faceLostGraceMs: number;
  faceRecoverMs: number;
};

export function useFocusTimer({
  facePresent,
  monitoring,
  faceLostGraceMs,
  faceRecoverMs,
}: Options) {
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION_MIN * 60_000);
  const [remainingMs, setRemainingMs] = useState(DEFAULT_DURATION_MIN * 60_000);
  const [phase, setPhase] = useState<TimerPhase>('idle');

  const phaseRef = useRef(phase);
  const remainingRef = useRef(remainingMs);
  const lostSinceRef = useRef<number | null>(null);
  const presentSinceRef = useRef<number | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    remainingRef.current = remainingMs;
  }, [remainingMs]);

  const setDurationMinutes = useCallback((minutes: number) => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'done') return;
    const ms = Math.max(1, minutes) * 60_000;
    setDurationMs(ms);
    setRemainingMs(ms);
    setPhase('idle');
  }, []);

  const start = useCallback(() => {
    if (remainingRef.current <= 0) {
      setRemainingMs(durationMs);
      remainingRef.current = durationMs;
    }
    lostSinceRef.current = null;
    presentSinceRef.current = Date.now();
    setPhase('running');
  }, [durationMs]);

  const pause = useCallback(() => {
    if (phaseRef.current === 'running' || phaseRef.current === 'distracted') {
      lostSinceRef.current = null;
      presentSinceRef.current = null;
      setPhase('paused');
    }
  }, []);

  const stop = useCallback(() => {
    lostSinceRef.current = null;
    presentSinceRef.current = null;
    setRemainingMs(durationMs);
    remainingRef.current = durationMs;
    setPhase('idle');
  }, [durationMs]);

  // Countdown only while running (not distracted / paused).
  useEffect(() => {
    if (phase !== 'running') return;

    const id = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - 250;
        if (next <= 0) {
          remainingRef.current = 0;
          setPhase('done');
          return 0;
        }
        remainingRef.current = next;
        return next;
      });
    }, 250);

    return () => clearInterval(id);
  }, [phase]);

  // Face grace / recover while monitoring an active session.
  useEffect(() => {
    if (!monitoring) return;
    if (phase !== 'running' && phase !== 'distracted') return;

    const tick = () => {
      const now = Date.now();
      if (facePresent) {
        lostSinceRef.current = null;
        if (presentSinceRef.current == null) presentSinceRef.current = now;
        if (
          phaseRef.current === 'distracted' &&
          now - (presentSinceRef.current ?? now) >= faceRecoverMs
        ) {
          setPhase('running');
        }
      } else {
        presentSinceRef.current = null;
        if (lostSinceRef.current == null) lostSinceRef.current = now;
        if (
          phaseRef.current === 'running' &&
          now - (lostSinceRef.current ?? now) >= faceLostGraceMs
        ) {
          setPhase('distracted');
        }
      }
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [facePresent, monitoring, phase, faceLostGraceMs, faceRecoverMs]);

  return {
    durationMs,
    remainingMs,
    phase,
    setDurationMinutes,
    start,
    pause,
    stop,
  };
}
