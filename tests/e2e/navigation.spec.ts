import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('Hugo page shows nav with correct current page', async ({ page }) => {
    await page.goto('/hugo/');
    const nav = page.locator('nav[aria-label="Site navigation"]');
    await expect(nav).toBeVisible();

    const currentLink = nav.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Home');
    await expect(currentLink).toHaveAttribute('href', '/hugo/');
  });

  test('Astro page shows nav with correct current page', async ({ page }) => {
    await page.goto('/astro/');
    const nav = page.locator('nav[aria-label="Site navigation"]');
    await expect(nav).toBeVisible();

    const currentLink = nav.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Home');
    await expect(currentLink).toHaveAttribute('href', '/astro/');
  });

  test('Hugo nav section is open when on Hugo page', async ({ page }) => {
    await page.goto('/hugo/');
    const hugoDetails = page.locator('.nav__section details', { has: page.locator('summary:text("Hugo")') });
    await expect(hugoDetails).toHaveAttribute('open', '');
  });

  test('Astro nav section is open when on Astro page', async ({ page }) => {
    await page.goto('/astro/');
    const astroDetails = page.locator('.nav__section details', { has: page.locator('summary:text("Astro")') });
    await expect(astroDetails).toHaveAttribute('open', '');
  });

  test('navigate from Hugo to Astro', async ({ page }) => {
    await page.goto('/hugo/');
    // Open the Astro section
    const astroSummary = page.locator('.nav__section details summary:text("Astro")');
    await astroSummary.click();

    // Click the Astro Home link
    const astroLink = page.locator('.nav__link[href="/astro/"]');
    await astroLink.click();

    await expect(page).toHaveURL(/\/astro\//);
    const currentLink = page.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Home');
  });

  test('navigate from Astro to Hugo', async ({ page }) => {
    await page.goto('/astro/');
    // Open the Hugo section
    const hugoSummary = page.locator('.nav__section details summary:text("Hugo")');
    await hugoSummary.click();

    // Click the Hugo Home link
    const hugoLink = page.locator('.nav__link[href="/hugo/"]');
    await hugoLink.click();

    await expect(page).toHaveURL(/\/hugo\//);
    const currentLink = page.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Home');
  });

  test('skip-to-content link moves focus to main content', async ({ page }) => {
    await page.goto('/hugo/');
    // Tab to the skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    const main = page.locator('#main-content');
    await expect(main).toBeFocused();
  });

  test('keyboard navigation through sidebar nav', async ({ page }) => {
    await page.goto('/hugo/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    // Hugo section is already open. Focus its summary.
    const hugoSummary = nav.locator('summary:text("Hugo")');
    await hugoSummary.focus();
    await expect(hugoSummary).toBeFocused();

    // Tab from the summary into the open section — should reach a nav link
    await page.keyboard.press('Tab');
    const focusedLink = page.locator(':focus');
    await expect(focusedLink).toHaveAttribute('class', /nav__link/);
  });

  test('HTML landmarks are correct', async ({ page }) => {
    await page.goto('/hugo/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[aria-label="Site navigation"]')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
