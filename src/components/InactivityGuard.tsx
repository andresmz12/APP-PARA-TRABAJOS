'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';

const TIMEOUT_MS = 5 * 60 * 1000;   // 5 minutos
const WARNING_MS = 30 * 1000;        // aviso 30 segundos antes

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;

export default function InactivityGuard() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  const logout = useCallback(() => {
    signOut({ callbackUrl: '/login' });
  }, []);

  const startCountdown = useCallback(() => {
    setShowWarning(true);
    setSecondsLeft(30);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!);
          logout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [logout]);

  const resetTimer = useCallback(() => {
    // Si el aviso está visible, no resetear por actividad —
    // el usuario debe hacer clic en "Continuar"
    if (showWarning) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);

    warnTimerRef.current = setTimeout(startCountdown, TIMEOUT_MS - WARNING_MS);
    timerRef.current = setTimeout(logout, TIMEOUT_MS);
  }, [showWarning, startCountdown, logout]);

  function continueSession() {
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetTimer();
  }

  useEffect(() => {
    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-amber-600">{secondsLeft}</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">¿Sigues ahí?</h2>
        <p className="text-sm text-slate-500 mb-6">
          Por seguridad, cerraremos tu sesión en{' '}
          <span className="font-semibold text-amber-600">{secondsLeft} segundo{secondsLeft !== 1 ? 's' : ''}</span>{' '}
          por inactividad.
        </p>
        <div className="flex gap-3">
          <button
            onClick={logout}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cerrar sesión
          </button>
          <button
            onClick={continueSession}
            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
          >
            Sí, continuar
          </button>
        </div>
      </div>
    </div>
  );
}
