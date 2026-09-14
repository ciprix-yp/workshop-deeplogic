/**
 * Validarea adresei de expeditor — funcție PURĂ, separată de `resend.ts`
 * tocmai ca să fie testabilă (`resend.ts` importă `astro:env/server`, deci nu
 * poate fi încărcat în vitest).
 *
 * Incidentul din 14 septembrie 2026, pe scurt: secretul `EMAIL_FROM` din
 * producție conținea GHILIMELELE literale din `.env` —
 * `"Ciprian Micu - Deep Logic <ciprian@deeplogic.ro>"` — fiindcă
 * `wrangler secret put` copiază valoarea exact cum i-o dai, inclusiv
 * ghilimelele pe care dotenv le-ar fi eliminat local. Resend a respins fiecare
 * trimitere cu „Invalid `from` field".
 *
 * Consecințele, toate tăcute: emailul 1 pica în ciclu → funcția Inngest eșua →
 * oamenii rămâneau în bază cu `welcome_sent_at` NULL și fără nicio confirmare;
 * alerta reconcilierii B11 pica pe același motiv, deci nici alarma nu pleca;
 * iar scripturile locale funcționau, fiindcă `.env` e parsat cu dotenv. Două
 * înscrieri reale au stat șase ore fără confirmare, cu evenimentul la două
 * zile distanță.
 *
 * Verificarea de mai jos transformă exact greșeala aia dintr-un eșec tăcut pe
 * fiecare email într-o eroare imediată, cu instrucțiunea de reparare în mesaj.
 */

/**
 * Formatele acceptate de Resend: `email@exemplu.ro` sau
 * `Nume <email@exemplu.ro>`. Ghilimelele sunt interzise explicit — ele sunt
 * greșeala reală întâlnită, nu o ipoteză.
 */
const FORMAT = /^(?:[^"<>]*<[^\s"<>@]+@[^\s"<>@]+>|[^\s"<>@]+@[^\s"<>@]+)$/;

export function valideazaExpeditor(brut: string | undefined): string {
  const from = (brut ?? '').trim();

  if (!FORMAT.test(from)) {
    throw new Error(
      `EMAIL_FROM are format invalid: ${JSON.stringify(brut)}. ` +
        'Resend acceptă doar `email@exemplu.ro` sau `Nume <email@exemplu.ro>`, ' +
        'fără ghilimele în jur. Repară cu: ' +
        "printf 'Nume <email@exemplu.ro>' | wrangler secret put EMAIL_FROM",
    );
  }

  return from;
}
