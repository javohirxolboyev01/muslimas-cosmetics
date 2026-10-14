import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'mc-scroll';
/** Ma'lumot kech yuklansa, sahifa yetarlicha uzaygunicha shuncha vaqt urinib ko'ramiz */
const RESTORE_TIMEOUT = 2000;

const positions = new Map<string, number>(readSaved());

function readSaved(): [string, number][] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...positions].slice(-50)));
  } catch {
    /* maxfiy rejim — faqat xotirada qoladi */
  }
}

/** To'g'ridan-to'g'ri ochilgan sahifaning kaliti har doim 'default' — uni manzil bilan ajratamiz */
const entryKey = (loc: { key: string; pathname: string; search: string }) =>
  loc.key === 'default' ? `default:${loc.pathname}${loc.search}` : loc.key;

const jump = (y: number) => window.scrollTo({ top: y, left: 0, behavior: 'instant' });

/**
 * Scroll boshqaruvi:
 *  - yangi sahifaga o'tilganda (PUSH/REPLACE, boshqa pathname) — eng tepadan ochiladi;
 *  - faqat ?filtr o'zgarsa — joy saqlanadi;
 *  - ortga/oldinga (POP) — har bir tarix yozuvi o'z joyiga, animatsiyasiz qaytadi.
 */
export function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(entryKey(location));
  const firstRun = useRef(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const onScroll = () => {
      positions.set(keyRef.current, window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = entryKey(location);
    const initial = firstRun.current;
    firstRun.current = false;
    const pathChanged = prevPath.current !== location.pathname;
    prevPath.current = location.pathname;

    // Havoladan yangi ochilgan sahifa — tepadan. Tashqi saytdan "ortga" qaytilsa (tarix kaliti bor) — saqlangan joyga
    if (initial && location.key === 'default') return;

    if (navType !== 'POP') {
      if (pathChanged && !location.hash) jump(0);
      return;
    }

    const y = positions.get(keyRef.current);
    if (y == null) return;

    // Kontent (rasm, ro'yxat) hali to'liq chizilmagan bo'lishi mumkin — joyga yetguncha qayta urinamiz,
    // foydalanuvchi o'zi scroll qila boshlasa to'xtaymiz
    const started = performance.now();
    let raf = 0;
    const stop = () => cancelAnimationFrame(raf);
    const attempt = () => {
      jump(y);
      if (Math.abs(window.scrollY - y) > 2 && performance.now() - started < RESTORE_TIMEOUT) raf = requestAnimationFrame(attempt);
    };
    attempt();
    const opts = { passive: true, once: true } as const;
    window.addEventListener('touchstart', stop, opts);
    window.addEventListener('wheel', stop, opts);
    return () => {
      stop();
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('wheel', stop);
    };
  }, [location, navType]);

  return null;
}
