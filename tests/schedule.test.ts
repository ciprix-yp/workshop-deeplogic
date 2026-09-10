/**
 * Clasificatorul de fereastră al înscrierii (B-3, fix 2026-09-10).
 *
 * Funcție pură, fără `astro:env` — de aceea e testabilă direct, spre deosebire
 * de restul ciclului Inngest. Toate momentele scrise cu offset explicit
 * `+03:00`, ca testul să nu depindă de fusul mașinii care îl rulează.
 */

import { describe, it, expect } from 'vitest';
import { PROGRAM, fereastraInscrierii } from '../src/inngest/schedule';

const la = (iso: string) => fereastraInscrierii(new Date(iso));

describe('fereastraInscrierii — granițele celor patru ferestre', () => {
  it('înainte de 14 septembrie 09:00 → ciclul normal', () => {
    expect(la('2026-09-10T12:00:00+03:00')).toBe('normala');
    expect(la('2026-09-14T08:59:59+03:00')).toBe('normala');
  });

  it('exact la momentul reconfirmării → `tarziu`, nu `normala`', () => {
    // Graniță inclusivă: la 09:00 fix, emailul 2 pleacă deja spre toți
    // ceilalți, deci o înscriere nouă nu mai are ce reconfirmare să aștepte.
    expect(la(PROGRAM.RECONFIRMARE_TRIMISA)).toBe('tarziu');
  });

  it('între reconfirmare și cutoff → `tarziu`', () => {
    expect(la('2026-09-15T18:00:00+03:00')).toBe('tarziu');
    expect(la('2026-09-16T10:59:59+03:00')).toBe('tarziu');
  });

  it('exact la cutoff → `same_day`', () => {
    expect(la(PROGRAM.CUTOFF_RECONFIRMARE)).toBe('same_day');
  });

  it('între cutoff și finalul evenimentului → `same_day`', () => {
    expect(la('2026-09-16T12:00:00+03:00')).toBe('same_day');
    expect(la('2026-09-16T16:59:59+03:00')).toBe('same_day');
  });

  it('de la finalul evenimentului încolo → `dupa_eveniment`', () => {
    expect(la(PROGRAM.EVENIMENT_SFARSIT)).toBe('dupa_eveniment');
    expect(la('2026-09-17T09:00:00+03:00')).toBe('dupa_eveniment');
  });
});

describe('PROGRAM — momentele rămân în ordine cronologică', () => {
  it('reconfirmare < cutoff < check-in < final', () => {
    const t = [
      PROGRAM.RECONFIRMARE_TRIMISA,
      PROGRAM.CUTOFF_RECONFIRMARE,
      PROGRAM.CHECKIN_TRIMIS,
      PROGRAM.EVENIMENT_SFARSIT,
    ].map((s) => Date.parse(s));

    expect(t.every((v) => Number.isFinite(v))).toBe(true);
    expect([...t].sort((a, b) => a - b)).toEqual(t);
  });

  it('toate au offset explicit — nu ora „plutitoare" a mașinii', () => {
    for (const moment of Object.values(PROGRAM)) {
      expect(moment).toMatch(/[+-]\d{2}:\d{2}$/);
    }
  });
});
