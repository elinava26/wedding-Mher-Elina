import { WEDDING_DEADLINE_ISO } from './constants';

export interface TimeRemaining {
  readonly totalMs: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Mirrors Tilda `handleOverflowMonth` for invalid calendar dates. */
export function handleOverflowMonth(date: string): string {
  const splittedDate: string[] = date.split('-');
  const year: number = parseInt(splittedDate[0]!, 10);
  let month: number = parseInt(splittedDate[1]!, 10);
  let day: number = parseInt(splittedDate[2]!, 10);
  const countDays: number = new Date(year, month, 0).getDate();
  if (day > countDays) {
    const difference: number = Math.abs(countDays - day);
    day = difference;
    month += 1;
    if (month > 12) {
      return `${year + 1}-01-${String(day).padStart(2, '0')}`;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return date;
}

export function getTimeRemaining(end: Date): TimeRemaining {
  const totalMs: number = end.getTime() - Date.now();
  if (totalMs <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const seconds: number = Math.floor((totalMs / 1000) % 60);
  const minutes: number = Math.floor((totalMs / 1000 / 60) % 60);
  const hours: number = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days: number = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  return { totalMs, days, hours, minutes, seconds };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatMirrorLine(t: TimeRemaining): string {
  const d: string = t.days >= 100 ? String(t.days) : pad2(t.days);
  return `${d} : ${pad2(t.hours)} : ${pad2(t.minutes)} : ${pad2(t.seconds)}`;
}

/**
 * Drives hidden `.t415__*` spans (same hooks as the original page) and the visible
 * Zero-style line used on the dark RSVP card.
 */
export function initCountdown(): void {
  const end: Date = new Date(WEDDING_DEADLINE_ISO);

  const clock: HTMLElement | null = document.getElementById('t415__timer1674619851');
  const daysSpan: HTMLElement | null = clock?.querySelector('.t415__days') ?? null;
  const hoursSpan: HTMLElement | null = clock?.querySelector('.t415__hours') ?? null;
  const minutesSpan: HTMLElement | null = clock?.querySelector('.t415__minutes') ?? null;
  const secondsSpan: HTMLElement | null = clock?.querySelector('.t415__seconds') ?? null;

  const visibleLine: HTMLElement | null = document.querySelector('[data-countdown-display]');

  function tick(): void {
    const time: TimeRemaining = getTimeRemaining(end);
    const dStr: string = time.days >= 100 ? String(time.days) : pad2(time.days);
    const hStr: string = pad2(time.hours);
    const mStr: string = pad2(time.minutes);
    const sStr: string = pad2(time.seconds);

    if (daysSpan) daysSpan.innerHTML = dStr;
    if (hoursSpan) hoursSpan.innerHTML = hStr;
    if (minutesSpan) minutesSpan.innerHTML = mStr;
    if (secondsSpan) secondsSpan.innerHTML = sStr;

    if (visibleLine) {
      visibleLine.textContent = formatMirrorLine(time);
    }
  }

  tick();
  window.setInterval(tick, 1000);
}
