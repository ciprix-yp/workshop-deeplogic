import { test, expect } from '@playwright/test';

/**
 * H1-ul din hero: trei rânduri de copy = trei rânduri vizuale, pe orice ecran.
 *
 * Cerință directă (2026-09-07, Ciprian). Înainte, cele trei `span`-uri aveau
 * aceeași mărime și se rupeau singure la wrap — pe 360px H1-ul ocupa cinci
 * rânduri vizuale, iar unde cădea ruptura depindea de lățime.
 *
 * Construcția din `S01Hero.astro` garantează contractul cu `white-space:
 * nowrap` + o mărime de font derivată din lățimea containerului (`cqi`),
 * folosind factori de lățime MĂSURAȚI pentru textul curent. Factorii aceia
 * sunt singura piesă care poate rămâne în urmă: dacă cineva schimbă copy-ul
 * H1-ului fără să-i remăsoare lățimea, rândul iese din container — tăcut, sub
 * `overflow-x: hidden` de pe body. Testul ăsta e alarma.
 */

const LATIMI = [320, 360, 390, 430, 540, 768, 1024, 1280, 1920];

/** Sub pragul ăsta titlul nu mai e titlu, e text de corp îngroșat. */
const PRAG_LIZIBIL_PX = 18;

test('fiecare rând din H1 încape pe un singur rând, la orice lățime', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  for (const latime of LATIMI) {
    await page.setViewportSize({ width: latime, height: 900 });

    const masuratori = await page.evaluate(() => {
      const container = document.querySelector('.hero .h1-fit') as HTMLElement;
      const randuri = [...document.querySelectorAll<HTMLElement>('.hero .rand')].map((el) => {
        // `getBoundingClientRect()` pe element dă lățimea BLOCULUI (100% din
        // container), nu a textului. Range-ul măsoară conținutul real.
        const range = document.createRange();
        range.selectNodeContents(el);
        return {
          text: el.textContent?.trim() ?? '',
          latimeText: range.getBoundingClientRect().width,
          depaseste: el.scrollWidth > el.clientWidth,
          fontSize: Number.parseFloat(getComputedStyle(el).fontSize),
        };
      });
      return { latimeContainer: container.clientWidth, randuri };
    });

    for (const rand of masuratori.randuri) {
      expect(
        rand.latimeText,
        `„${rand.text}" la ${latime}px depășește containerul (${masuratori.latimeContainer}px)`
      ).toBeLessThanOrEqual(masuratori.latimeContainer);

      expect(rand.depaseste, `„${rand.text}" se revarsă din bloc la ${latime}px`).toBe(false);

      expect(
        rand.fontSize,
        `„${rand.text}" a coborât la ${rand.fontSize}px la ${latime}px — copy prea lung pentru lățimea disponibilă`
      ).toBeGreaterThanOrEqual(PRAG_LIZIBIL_PX);
    }

    // Ierarhia cerută: rândul de deschidere e vizibil mai mic decât întrebarea,
    // iar cele două rânduri ale întrebării sunt identice între ele.
    const [setup, intrebare1, intrebare2] = masuratori.randuri;
    expect(intrebare1.fontSize, `rândurile întrebării diferă la ${latime}px`).toBeCloseTo(
      intrebare2.fontSize,
      1
    );
    expect(setup.fontSize, `rândul de deschidere nu e mai mic la ${latime}px`).toBeLessThan(
      intrebare1.fontSize * 0.9
    );
  }
});

test('pagina nu capătă scroll orizontal din cauza H1-ului', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  for (const latime of [320, 360, 390]) {
    await page.setViewportSize({ width: latime, height: 900 });
    // `body { overflow-x: hidden }` ar ascunde o depășire pe body; documentul
    // rămâne martorul onest.
    const depasire = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(depasire, `scroll orizontal la ${latime}px`).toBeLessThanOrEqual(0);
  }
});
