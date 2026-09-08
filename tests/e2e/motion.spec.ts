import { test, expect } from '@playwright/test';

/**
 * Mișcarea, verificată în browser.
 *
 * Pivot de arhitectură (2026-09-01, Ciprian): motorul de scroll custom
 * (MotionEngine.astro + storyboard.json, opt de scene) a fost retras în
 * favoarea Lenis + GSAP ScrollTrigger — folosit STRICT în §06 CeFacem (cei
 * cinci pași ai metodologiei), singurul pin/scrub de pe pagină.
 *
 * **§06 CeFacem retrasă (2026-09-08)** — „renunțăm la metodologie... explicăm
 * cum ajungem la rezultat" (acoperit acum de §05 Soluție, metodă proprie de
 * 6 pași). Era singurul consumator de Lenis+GSAP de pe pagină — retragerea
 * ei a scos apparatus-ul întreg (`Base.astro`, `docs/DECIZII.md` D78). Cele
 * două teste de mai jos care verificau pin/scrub-ul GSAP (`§06: pașii
 * metodologiei...`, `cu prefers-reduced-motion, pașii...`) au fost șterse
 * odată cu secțiunea — nu mai există ce să verifice.
 *
 * Pivot ulterior (2026-09-02, „carduri 3D" + accente): restul paginii NU mai
 * e static prin construcție — există un reveal la scroll (fade + ridicare,
 * vanilla, fără GSAP) pe fiecare `<Sectiune>` cu `reveal` implicit `true`,
 * plus tilt 3D la cursor pe cardurile cu profunzime. Ambele opt-in prin
 * `depth` (Base.astro), niciodată vizibile fără JS — vezi tokens.css
 * `[data-reveal]`/`.card-3d`.
 *
 * Cel mai important test rămâne cel fără JS: o pagină care se bazează pe un
 * script ca să-și arate textul e o pagină care uneori nu-l arată deloc.
 */

test('fără JavaScript, tot conținutul rămâne vizibil', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  // `.exemple` → `.lista` (2026-09-07, a treia rundă — copy nou §02, aceeași
  // clasă refolosită pentru ambele liste ale secțiunii, vezi S02Problema.astro).
  // `#ce-facem .bloc` a dispărut odată cu secțiunea (2026-09-08) — înlocuit
  // cu `#solutie .pasi li` (metoda proprie a §05, listă echivalentă).
  for (const sel of ['#problema .lista li', '#agravare p', '#solutie .pasi li', '#rezultatul li']) {
    const el = page.locator(sel).first();
    await expect(el).toBeVisible();
    await expect(el).toHaveCSS('opacity', '1');
  }

  await ctx.close();
});

test('fără JavaScript, formularul rămâne un bloc normal în flux, nu un dialog închis', async ({ browser }) => {
  // DialogInscriere.astro randează `<dialog open>` static pe server. Fără JS
  // ca să cheme `.close()`, browserul îl arată exact ca un bloc obișnuit —
  // niciun `showModal()`, niciun backdrop, niciun element ascuns. Un
  // formular care are nevoie de JS ca să existe e un formular care pierde
  // înscrieri fără să știi.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');

  const dialog = page.locator('#inscriere');
  await dialog.scrollIntoViewIfNeeded();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#form-inscriere')).toBeVisible();
  await expect(page.locator('#form-inscriere')).toHaveAttribute('action', '/api/register');
  await expect(page.locator('#form-inscriere')).toHaveAttribute('method', 'POST');
  // NU verificăm `.cf-turnstile` vizibil — widget-ul e randat de scriptul
  // Cloudflare (api.js), inaccesibil fără JS prin definiție.
  await expect(page.locator('input[name="nume"]')).toBeVisible();
  await expect(page.locator('button.cta-submit')).toBeVisible();

  await ctx.close();
});

test('butonul CTA flotant apare după hero și dispare la formular — pe mobil', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto('/');

  const buton = page.locator('#cta-floating');
  // În hero, CTA-ul e deja pe ecran — un buton flotant ar dubla același buton.
  await expect(buton).toBeHidden();

  await page.locator('#facilitator').scrollIntoViewIfNeeded();
  // Un mic ghiont după — de la runda cu ascunderea la inactivitate
  // (2026-09-07): fără el, fereastra în care butonul e vizibil aici e
  // îngustă (500ms–1000ms de la finalul glisării animate a
  // `scrollIntoView`, care poate fi scurtă) — ocazional prea îngustă ca
  // polling-ul lui `expect` s-o prindă sigur. Ghiontul resetează debounce-ul
  // de ascundere, lărgind fereastra, fără să schimbe ce testăm de fapt
  // (că butonul apare când hero-ul a ieșit din cadru).
  await page.mouse.wheel(0, 30);
  await expect(buton).toBeVisible({ timeout: 3000 });

  // La chemarea finală dispare: ar dubla exact CTA-ul de-acolo.
  await page.locator('#inscriere-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(buton).toBeHidden();

  await ctx.close();
});

test('butonul CTA flotant apare și pe desktop (pivot 2026-09-02 — nu mai e doar-mobil)', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1280, height: 900 });

  const buton = page.locator('#cta-floating');
  await expect(buton).toBeHidden();

  await page.locator('#facilitator').scrollIntoViewIfNeeded();
  // Vezi nota din testul de mai sus (mobil): ghiont mic, ca fereastra de
  // vizibilitate să nu fie prea îngustă pentru polling-ul lui `expect`.
  await page.mouse.wheel(0, 30);
  await expect(buton).toBeVisible({ timeout: 3000 });

  await page.locator('#inscriere-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(buton).toBeHidden();
});

test('butonul CTA flotant dispare la 1s de la oprirea scroll-ului și reapare la scroll', async ({ page }) => {
  // Cerut explicit (2026-09-07). A doua condiție de ascundere, independentă
  // de suprapunerea cu alt `.cta` (testată mai sus): butonul nu trebuie să
  // concureze vizual cu conținutul cât timp cineva citește, static, o
  // secțiune. `page.mouse.wheel()`, nu `scrollIntoViewIfNeeded()`: al doilea
  // declanșează scroll-ul programatic al lui `scrollIntoView()`, animat de
  // `scroll-behavior: smooth` din tokens.css — durata lui variază cu
  // distanța și strică exact cronometrarea pe care vrem s-o verificăm.
  // Rotița produce evenimente `scroll` native, instant, neafectate de acea
  // proprietate CSS (se aplică doar scroll-ului programatic).
  await page.goto('/');

  const buton = page.locator('#cta-floating');

  // Salturi INSTANTE repetate (`behavior: 'instant'` — câștigă în fața
  // CSS-ului `scroll-behavior: smooth` din tokens.css, care s-ar aplica
  // altfel unui `scrollTo()` programatic), la ~150ms distanță unul de altul
  // — simulează un scroll CONTINUU de aproape o secundă, nu un singur salt
  // izolat. Un singur salt izolat ar reproduce exact „apare la 500ms,
  // dispare la 1000ms de la ACEEAȘI mișcare" — corect pentru un gest scurt,
  // dar nu ce verificăm aici: că rămâne vizibil CÂT TIMP se scrollează.
  // (Notă istorică: până la retragerea Lenis, 2026-09-08, un `wheel()` real
  // era în plus amortizat de `lerp: 0.1`, cu timing nedeterminist pentru un
  // test — motiv în plus, atunci, pentru salturi programatice. Fără Lenis,
  // motivul rămâne valabil doar pentru primul: simularea unui scroll
  // continuu, nu instantaneul unui singur gest.)
  for (let tinta = 500; tinta <= 3000; tinta += 500) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), tinta);
    await page.waitForTimeout(150);
  }

  // Peste 500ms de scroll continuu — deja vizibil.
  await expect(buton).toBeVisible({ timeout: 500 });

  // Debounce de ascundere: 1000ms de la ULTIMUL eveniment `scroll` (ultimul
  // salt din buclă). Marjă generoasă (câteva ori peste țintă, ca la
  // `scarcity.spec.ts`) — verificăm proprietatea reală (dispare, reapare),
  // nu cursa pe milisecundă.
  await expect(buton).toBeHidden({ timeout: 3000 });

  // Un singur scroll mic trebuie să-l aducă înapoi.
  await page.mouse.wheel(0, 40);
  await expect(buton).toBeVisible({ timeout: 2000 });
});
