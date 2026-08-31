import { test, expect } from '@playwright/test';

/**
 * Constrângerea 1, verificată mecanic: **conținutul nu depinde de animație.**
 *
 * Nu „textul nu dispare" — textul nu e țintă de animație deloc. Cele două
 * mecanisme care o garantează sunt structurale (`.sticla-chrome` separat de
 * `.continut`; valoarea implicită CSS a fiecărei variabile de progres e starea
 * SOSITĂ), dar amândouă se pot rupe la o singură regulă CSS scrisă greșit.
 * Testul ăsta e mecanismul; restul sunt precauții.
 *
 * Matricea: 16 carduri × 5 poziții de scroll (pc ≈ 0, 0.25, 0.5, 0.75, 1) ×
 * ambele direcții de parcurgere, plus o rulare cu JS complet dezactivat.
 *
 * Rulează pe proiectul `mobil-360` — 360px e breakpoint-ul de referință din
 * CLAUDE.md §2 și singurul unde placa acoperă aproape tot ecranul, deci
 * singurul unde o eroare de mască/clip ar avea consecințe. Pe desktop matricea
 * ar dubla timpul fără să acopere un caz nou.
 */

const TEXT = 'h1, h2, h3, p, li, dt, dd, label, legend, td, th';

/**
 * `transform: scale(var(--pc-s, 1))` se calculează ca `matrix(1,0,0,1,0,0)`,
 * nu ca `none` — o transformare identitate declarată rămâne o transformare.
 * Ambele forme înseamnă „nemișcat"; testul verifică geometria, nu sintaxa.
 */
const IDENTITATE = new Set(['none', 'matrix(1, 0, 0, 1, 0, 0)']);

test.describe('labirint — conținutul nu depinde de animație', () => {
  test('16 carduri × 5 poziții × ambele direcții: text opac, netransformat, nemascat', async ({ page }, info) => {
    // Doar pe breakpoint-ul de referință: 360px e singurul unde placa acoperă
    // aproape tot ecranul, deci singurul unde o eroare de mască/clip ar avea
    // consecințe. Pe desktop matricea ar dubla timpul fără un caz nou.
    test.skip(info.project.name !== 'mobil-360', 'matricea rulează pe breakpoint-ul de referință');
    test.setTimeout(180_000);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const nrCarduri = await page.locator('[data-card]').count();
    expect(nrCarduri).toBe(16);

    // Textul de referință, cules o dată cu pagina în repaus.
    const referinta = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-card] .continut')).map(
        (el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim().length,
      ),
    );

    const PC = [0, 0.25, 0.5, 0.75, 1];
    const probleme: string[] = [];

    for (const directie of [1, -1] as const) {
      const ordine = directie === 1 ? [...Array(nrCarduri).keys()] : [...Array(nrCarduri).keys()].reverse();
      for (const i of ordine) {
        for (const pc of PC) {
          const rezultat = await page.evaluate(
            async ([index, progres, dir, selector]) => {
              const carduri = Array.from(document.querySelectorAll<HTMLElement>('[data-card]'));
              const card = carduri[index as number];
              if (!card) return ['card lipsă'];

              let off = 0;
              let n: HTMLElement | null = card;
              while (n) {
                off += n.offsetTop;
                n = n.offsetParent as HTMLElement | null;
              }
              // pc = 1 − |off − scrollY| / vh  ⇒  scrollY = off ± (1−pc)·vh.
              // Semnul urmează direcția de parcurgere, ca să prindem ambele
              // ramuri ale valorii absolute din formulă.
              const tinta = off + (dir as number) * (1 - (progres as number)) * window.innerHeight;
              window.scrollTo({ top: Math.max(0, tinta), behavior: 'instant' });
              await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

              const gasite: string[] = [];
              const continut = card.querySelector<HTMLElement>('.continut');
              if (!continut) return ['fără .continut'];

              const sC = getComputedStyle(continut);
              for (const [prop, rau] of [
                ['clipPath', 'none'],
                ['maskImage', 'none'],
                ['maxHeight', 'none'],
              ] as const) {
                if (sC[prop] !== rau) gasite.push(`.continut ${prop}=${sC[prop]}`);
              }
              if (sC.overflow === 'hidden' || sC.overflowY === 'hidden') gasite.push('.continut overflow hidden');
              if (sC.transform !== 'none') gasite.push(`.continut transform=${sC.transform}`);
              if (sC.opacity !== '1') gasite.push(`.continut opacity=${sC.opacity}`);

              for (const el of Array.from(continut.querySelectorAll<HTMLElement>(selector as string))) {
                if (!el.textContent?.trim()) continue;
                if (el.closest('[data-reveal]')) continue; // sistem separat, testat în motion.spec.ts
                const s = getComputedStyle(el);
                if (s.opacity !== '1') gasite.push(`${el.tagName} opacity=${s.opacity}`);
                if (s.visibility !== 'visible') gasite.push(`${el.tagName} visibility=${s.visibility}`);
                if (s.transform !== 'none') gasite.push(`${el.tagName} transform=${s.transform}`);
                if (gasite.length > 6) break;
              }

              const lungime = (continut.textContent ?? '').replace(/\s+/g, ' ').trim().length;
              return gasite.length ? gasite : [`OK:${lungime}`];
            },
            [i, pc, directie, TEXT] as const,
          );

          const prim = rezultat[0] ?? '';
          if (!prim.startsWith('OK:')) {
            probleme.push(`card ${i + 1}, pc=${pc}, dir=${directie}: ${rezultat.join(' | ')}`);
          } else {
            const lungime = Number(prim.slice(3));
            const ref = referinta[i] ?? 0;
            if (ref > 0 && lungime < ref * 0.95) {
              probleme.push(`card ${i + 1}, pc=${pc}, dir=${directie}: text ${lungime}/${ref} (<95%)`);
            }
          }
        }
      }
    }

    expect(probleme, probleme.slice(0, 10).join('\n')).toEqual([]);
  });

  test('fără JavaScript: toate cele 16 cromuri sunt la starea SOSITĂ', async ({ browser }) => {
    // Ăsta e testul care contează. Valoarea implicită a fiecărei variabile de
    // progres e starea sosită (`opacity: var(--pc-o, 1)`), deci starea
    // „neajunsă" nu poate exista fără JS. Fără regula asta, un script care nu
    // se încarcă în browserul in-app din WhatsApp ar lăsa 16 plăci la 0.955 și
    // 0.30 — adică pagina ar arăta stricat exact acolo unde vine traficul.
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/');

    const stari = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-card] [data-chrome]')).map((el) => {
        const s = getComputedStyle(el);
        return [s.opacity, s.transform];
      }),
    );
    expect(stari.length).toBe(16);
    for (const [opacitate, transformare] of stari) {
      expect(opacitate).toBe('1');
      expect(IDENTITATE.has(transformare ?? '')).toBe(true);
    }

    // Muchia și specularul (pseudo-elemente) citesc `--pc-o` de pe gazdă.
    const opacitatiPseudo = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-card] [data-chrome]')).flatMap((el) => [
        getComputedStyle(el, '::before').opacity,
        getComputedStyle(el, '::after').opacity,
      ]),
    );
    for (const o of opacitatiPseudo) expect(o).toBe('1');

    // Și conținutul e vizibil, evident.
    for (const sel of ['#problema .continut', '#ce-pleci-cu-tine .continut', '#inscriere .continut']) {
      await expect(page.locator(sel).first()).toBeVisible();
      await expect(page.locator(sel).first()).toHaveCSS('opacity', '1');
    }

    await ctx.close();
  });

  test('tot ce se animă e aria-hidden — lista din lint-decor.mjs, verificată în DOM', async ({ page }) => {
    // Perechea browser a lui `scripts/lint-decor.mjs`: lint-ul verifică
    // static că doar clasele decorative primesc proprietăți de animație,
    // testul ăsta verifică că acele clase sunt chiar decorative.
    await page.goto('/');
    const neascunse = await page.evaluate(() => {
      const clase = ['.sticla-chrome', '.labirint', '.subiect', '.checkpoint'];
      const rele: string[] = [];
      for (const c of clase) {
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(c))) {
          if (!el.closest('[aria-hidden="true"]')) rele.push(`${c} #${rele.length}`);
        }
      }
      return rele;
    });
    expect(neascunse).toEqual([]);
  });

  test('prefers-reduced-motion: labirint static, subiect absent, plăci sosite', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 360, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    // Harta rămâne — sub reduced-motion pierzi traversarea, nu orientarea.
    await expect(page.locator('[data-labirint]')).toBeVisible();
    await expect(page.locator('[data-checkpoint]').first()).toBeVisible();

    // Subiectul nu se randează: un marcaj nemișcat n-are referent.
    await expect(page.locator('[data-subiect]').first()).toBeHidden();

    // Banda nu s-a mișcat, plăcile sunt la starea sosită.
    const stari = await page.evaluate(() => {
      const banda = document.querySelector<HTMLElement>('[data-banda]');
      return {
        banda: banda ? getComputedStyle(banda).transform : 'lipsă',
        cromuri: Array.from(document.querySelectorAll<HTMLElement>('[data-chrome]')).map((el) => {
          const s = getComputedStyle(el);
          return [s.opacity, s.transform];
        }),
      };
    });
    expect(IDENTITATE.has(stari.banda)).toBe(true);
    expect(stari.cromuri.length).toBe(16);
    for (const [opacitate, transformare] of stari.cromuri) {
      expect(opacitate).toBe('1');
      expect(IDENTITATE.has(transformare ?? '')).toBe(true);
    }

    await ctx.close();
  });
});
