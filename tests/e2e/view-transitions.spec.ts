import { test, expect } from '@playwright/test';

test.describe('View Transitions', () => {
  test('Hugo pages have view-transition-name on shell elements', async ({ page }) => {
    await page.goto('/hugo/');
    const header = page.locator('.layout__header');
    const sidebar = page.locator('.layout__sidebar');
    const main = page.locator('#main-content');
    const footer = page.locator('.layout__footer');

    await expect(header).toHaveCSS('view-transition-name', 'site-header');
    await expect(sidebar).toHaveCSS('view-transition-name', 'site-sidebar');
    await expect(main).toHaveCSS('view-transition-name', 'main-content');
    await expect(footer).toHaveCSS('view-transition-name', 'site-footer');
  });

  test('Astro pages have view-transition-name on shell elements', async ({ page }) => {
    await page.goto('/astro/');
    const header = page.locator('.layout__header');
    const sidebar = page.locator('.layout__sidebar');
    const main = page.locator('#main-content');
    const footer = page.locator('.layout__footer');

    await expect(header).toHaveCSS('view-transition-name', 'site-header');
    await expect(sidebar).toHaveCSS('view-transition-name', 'site-sidebar');
    await expect(main).toHaveCSS('view-transition-name', 'main-content');
    await expect(footer).toHaveCSS('view-transition-name', 'site-footer');
  });

  test('Astro-to-Hugo links have data-astro-reload', async ({ page }) => {
    // Navigate to Hugo side first so the Hugo subsection is expanded and links are visible
    await page.goto('/hugo/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    const hugoLinks = nav.locator('.nav__link[href^="/hugo/"]');
    const count = await hugoLinks.count();
    expect(count).toBeGreaterThan(0);

    // Hugo links on the Hugo side should NOT have data-astro-reload (same platform)
    // Check from Astro side: the Hugo subsection link itself should have data-astro-reload
    await page.goto('/astro/');
    const hugoSubsectionLink = page.locator('.nav__subsection-link:text("Hugo")');
    await expect(hugoSubsectionLink).toHaveAttribute('data-astro-reload');
  });

  test('Hugo page has view-transition meta tag', async ({ page }) => {
    await page.goto('/hugo/');
    const meta = page.locator('meta[name="view-transition"]');
    await expect(meta).toHaveAttribute('content', 'same-origin');
  });

  test.describe('screenshots', () => {
    test('cross-platform navigation Hugo to Astro', async ({ page }) => {
      await page.goto('/hugo/');
      await page.screenshot({ path: 'tests/e2e/screenshots/view-transition-hugo-before.png', fullPage: true });

      // Click the Astro subsection link to navigate
      await page.locator('.nav__subsection-link:text("Astro")').click();
      await expect(page).toHaveURL(/\/astro\//);

      await page.screenshot({ path: 'tests/e2e/screenshots/view-transition-astro-after.png', fullPage: true });
    });

    test('cross-platform navigation Astro to Hugo', async ({ page }) => {
      await page.goto('/astro/');
      await page.screenshot({ path: 'tests/e2e/screenshots/view-transition-astro-before.png', fullPage: true });

      // Click the Hugo subsection link to navigate
      await page.locator('.nav__subsection-link:text("Hugo")').click();
      await expect(page).toHaveURL(/\/hugo\//);

      await page.screenshot({ path: 'tests/e2e/screenshots/view-transition-hugo-after.png', fullPage: true });
    });
  });
});
