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

export const prerender = false;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    registered,
    waitlisted,
    seatFreed,
    leftoverWaitlistNotice,
    retentionSweep,
    reconciliereWelcome,
  ],
});
