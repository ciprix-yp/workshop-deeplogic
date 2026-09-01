/**
 * GET /api/locuri-disponibile — contorul public de locuri.
 *
 * Citire, nu tranziție de stare — nicio problemă cu B2 (GET nu mută nimic).
 * Apelat de BaraScarcity.astro, client-side, la fiecare încărcare de pagină.
 * Traficul așteptat e mic (eveniment local, 30 de locuri), deci o interogare
 * directă e suficientă — fără cache, care ar fi infrastructură nevândută
 * pentru o problemă care nu există încă (vezi CLAUDE.md, „construcție peste
 * validare").
 */

import type { APIRoute } from 'astro';
import { locuriDisponibilePublic } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const { ramase, maxime } = await locuriDisponibilePublic();
    return new Response(JSON.stringify({ ramase, maxime }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Foarte scurt: suficient să absoarbă rafale de la același vizitator
        // (reveniri rapide între pagini), fără să întârzie vizibil un număr
        // care trebuie să rămână real.
        'Cache-Control': 'public, max-age=15',
      },
    });
  } catch (eroare) {
    console.error('locuriDisponibilePublic() a eșuat:', eroare);
    return new Response(JSON.stringify({ eroare: 'n-am putut citi locurile disponibile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
