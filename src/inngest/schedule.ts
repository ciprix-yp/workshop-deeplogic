/**
 * Momentele fixe ale ciclului de înscriere — sursă unică pentru
 * `step.sleepUntil()`.
 *
 * Toate cu offset explicit `+03:00` (EEST), nu doar data/ora goală — vezi
 * `docs/spec-tehnic-inscriere-16-09.md` § „Date fixe eveniment".
 */

export const PROGRAM = {
  /** Luni, 14 septembrie, 09:00 — pornește reconfirmarea (email 2). */
  RECONFIRMARE_TRIMISA: '2026-09-14T09:00:00+03:00',

  /** Miercuri, 16 septembrie, 11:00 — cutoff. Cine n-a răspuns devine `no_show`. */
  CUTOFF_RECONFIRMARE: '2026-09-16T11:00:00+03:00',

  /**
   * Miercuri, 16 septembrie, 13:30 — email 4 (check-in).
   *
   * B14: spec-ul original avea 14:00, ora de START a evenimentului. Oamenii
   * ajung mai devreme; un email de check-in trimis exact când ar trebui să
   * fie deja înăuntru e prea târziu ca să mai fie util.
   */
  CHECKIN_TRIMIS: '2026-09-16T13:30:00+03:00',

  /** Miercuri, 16 septembrie, 17:00 — s-a terminat. Nimic după ora asta. */
  EVENIMENT_SFARSIT: '2026-09-16T17:00:00+03:00',
} as const;

/**
 * În ce fereastră a picat înscrierea.
 *
 * Bug real, găsit la review-ul din 10 septembrie 2026 (B-3 din audit):
 * `step.sleepUntil()` cu o țintă din TRECUT se rezolvă instant, și nimic nu
 * compara ceasul cu `PROGRAM` înainte de a porni ciclul. Consecințele, pe
 * fereastră:
 *
 *   · `tarziu` (14 sep 09:00 → 16 sep 11:00) — emailul 1 și emailul 2 plecau
 *     la secundă distanță, iar emailul 1 promitea în subsol o scrisoare care
 *     sosea imediat. Cazul NORMAL pentru tot restul campaniei.
 *   · `same_day` (16 sep 11:00 → 17:00) — emailul 2 plecа cu un deadline deja
 *     trecut, apoi verificarea de la cutoff vedea `inscris`, marca `no_show`
 *     și difuza locul pe waitlist — la câteva secunde după înscriere.
 *
 * Decizia (Ciprian, 10 septembrie): înscrierile târzii nu se resping, se
 * tratează pe o cale proprie, cu copy onest. Vezi `registered.ts`.
 */
export type FereastraInscriere = 'normala' | 'tarziu' | 'same_day' | 'dupa_eveniment';

export function fereastraInscrierii(acum: Date): FereastraInscriere {
  const t = acum.getTime();
  if (t >= Date.parse(PROGRAM.EVENIMENT_SFARSIT)) return 'dupa_eveniment';
  if (t >= Date.parse(PROGRAM.CUTOFF_RECONFIRMARE)) return 'same_day';
  if (t >= Date.parse(PROGRAM.RECONFIRMARE_TRIMISA)) return 'tarziu';
  return 'normala';
}
