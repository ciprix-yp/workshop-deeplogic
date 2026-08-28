/**
 * Codificarea atașamentelor pentru Resend — extrasă separat de `resend.ts`
 * ca să fie testabilă fără `astro:env` (vezi `tests/attachments.test.ts`).
 *
 * BUG găsit la verificarea live, nu la citirea codului: API-ul Resend cere
 * `content` base64 — SDK-ul NU convertește, doar transmite mai departe orice
 * primește. Trimis text brut, serverul l-a interpretat CA base64 și l-a
 * „decodat", producând un `.ics` de 162 de octeți în loc de ~900 — garbage
 * binar, nu eroare zgomotoasă. Genul de defect care trece neobservat până
 * cineva deschide efectiv atașamentul.
 */

export interface AtasamentEmail {
  filename: string;
  /** Text brut — codificarea base64 se face aici, o singură dată. */
  content: string;
  contentType?: string;
}

export interface AtasamentResend {
  filename: string;
  contentType?: string;
  content: string;
}

export function codificaAtasamente(atasamente?: AtasamentEmail[]): AtasamentResend[] | undefined {
  return atasamente?.map((a) => ({
    filename: a.filename,
    contentType: a.contentType,
    content: Buffer.from(a.content, 'utf8').toString('base64'),
  }));
}
