/**
 * Notificare către organizator la fiecare înscriere — calea DURABILĂ.
 *
 * Cerută explicit (2026-09-11). Există în DOUĂ locuri, deliberat:
 *
 *   1. **Direct în `register.ts`**, imediat după scrierea în Supabase — calea
 *      scurtă, care nu depinde de Inngest. Motivul e un incident real: pe
 *      14 septembrie două înscrieri reale n-au primit nicio confirmare
 *      fiindcă lanțul prin Inngest era rupt, iar nimeni n-a aflat timp de
 *      șase ore. O notificare care împarte soarta cu exact sistemul care se
 *      poate rupe nu e o notificare.
 *   2. **Aici**, ca funcție Inngest — calea durabilă, cu retry, pentru cazul
 *      invers: aplicația a răspuns, dar trimiterea directă a eșuat.
 *
 * Dublura NU produce două emailuri: ambele căi folosesc aceeași cheie de
 * idempotență Resend, ancorată pe `registration_id`. Prima care reușește
 * trimite; a doua devine no-op. Același mecanism face inofensivă și
 * re-emiterea din reconcilierea B11.
 */

import { inngest, evtRegistered, evtWaitlisted } from '../client';
import { getInscriereCompleta } from '../../lib/supabase';
import { trimiteNotificareInscriere } from '../../lib/notificare';

export const notificareInscriere = inngest.createFunction(
  {
    id: 'workshop-notificare-inscriere',
    triggers: [{ event: evtRegistered }, { event: evtWaitlisted }],
    retries: 3,
  },
  async ({ event, step }) => {
    const { registration_id } = event.data;

    const date = await step.run('citeste-inscrierea', () => getInscriereCompleta(registration_id));
    if (!date) {
      return { trimis: false, motiv: 'înscrierea nu mai există' };
    }

    await step.run('trimite-notificarea', () =>
      trimiteNotificareInscriere(registration_id, date),
    );

    return { trimis: true, cine: date.email };
  },
);
