/**
 * Handler-ul standard Inngest pentru Astro — înregistrează toate funcțiile.
 * Inngest (Cloud sau Dev Server local) apelează ruta asta ca să descopere
 * funcțiile și să le declanșeze la evenimente.
 */

import { serve } from 'inngest/astro';
import { inngest } from '../../inngest/client';
import { registered } from '../../inngest/functions/registered';
import { waitlisted } from '../../inngest/functions/waitlisted';
import { seatFreed } from '../../inngest/functions/seat-freed';
import { leftoverWaitlistNotice } from '../../inngest/functions/leftover-waitlist-notice';
import { retentionSweep } from '../../inngest/functions/retention-sweep';
import { reconciliereWelcome } from '../../inngest/functions/reconciliere-welcome';
import { notificareInscriere } from '../../inngest/functions/notificare-inscriere';
import { EVENIMENT } from '../../content/copy';

export const prerender = false;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    registered,
    waitlisted,
    seatFreed,
    leftoverWaitlistNotice,
    retentionSweep,
    // Plasa B11 prinde înscrieri rămase fără email; cu înscrierile închise
    // (D119) n-are ce prinde. Revine odată cu comutatorul, la o ediție nouă.
    // `retentionSweep` rămâne necondiționat: e promisiune legală.
    ...(EVENIMENT.inscrieriDeschise ? [reconciliereWelcome] : []),
    notificareInscriere,
  ],
});
