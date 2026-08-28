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
} as const;
