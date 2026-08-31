import { test, expect } from '@playwright/test'

/**
 * Harness generic de regresie vizuala (landing-page-flow, Pasul 2).
 *
 * Adaptare fata de template: `waitUntil: 'networkidle'` inlocuit cu `'load'`
 * + asteptare explicita a fonturilor. Pe serverul de dev Astro, websocket-ul
 * de HMR ramane deschis la nesfarsit, deci 'networkidle' nu se atinge
 * niciodata (timeout 30s pe fiecare test) - acelasi motiv documentat deja in
 * scripts/screenshots.mjs, tool-ul nativ al proiectului pentru acelasi scop.
 */

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const

const PAGE_URL = process.env.VISUAL_QA_URL ?? 'http://localhost:3000'

async function asteaptaAsezarea(page: import('@playwright/test').Page) {
  await page.goto(PAGE_URL, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
}

for (const bp of BREAKPOINTS) {
  test(`${bp.name} — full page screenshot`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height })
    await asteaptaAsezarea(page)
    await expect(page).toHaveScreenshot(`${bp.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })
}

test('reduced motion — animated elements land at rest state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await asteaptaAsezarea(page)
  await page.waitForTimeout(500)
  await expect(page).toHaveScreenshot('desktop-reduced-motion.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  })
})

test('no console errors on load', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await asteaptaAsezarea(page)
  expect(errors, `Console errors found: ${errors.join('; ')}`).toHaveLength(0)
})
