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

  test('Hugo subsection is expanded when on Hugo page', async ({ page }) => {
    await page.goto('/hugo/');
    const hugoLink = page.locator('.nav__subsection-link:text("Hugo")');
    await expect(hugoLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('Astro subsection is expanded when on Astro page', async ({ page }) => {
    await page.goto('/astro/');
    const astroLink = page.locator('.nav__subsection-link:text("Astro")');
    await expect(astroLink).toHaveAttribute('aria-expanded', 'true');
  });

  test('only current section is expanded', async ({ page }) => {
    await page.goto('/hugo/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    // Site Components should be expanded (we're in it)
    const siteComponentsLink = nav.locator('.nav__section-link:text("Site Components")');
    await expect(siteComponentsLink).toHaveAttribute('aria-expanded', 'true');

    // Debugging Tools and Code Reviews should be collapsed
    const debuggingLink = nav.locator('.nav__section-link:text("Debugging Tools")');
    await expect(debuggingLink).toHaveAttribute('aria-expanded', 'false');

    const codeReviewsLink = nav.locator('.nav__section-link:text("Code Reviews")');
    await expect(codeReviewsLink).toHaveAttribute('aria-expanded', 'false');

    // Collapsed sections should not show their children
    const debuggingChildren = nav.locator('.nav__section:has(.nav__section-link:text("Debugging Tools")) > .nav__children');
    await expect(debuggingChildren).toHaveCount(0);
  });

  test('only current subsection is expanded within a section', async ({ page }) => {
    await page.goto('/hugo/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    // Hugo subsection should be expanded
    const hugoLink = nav.locator('.nav__subsection-link:text("Hugo")');
    await expect(hugoLink).toHaveAttribute('aria-expanded', 'true');

    // Astro subsection should be collapsed
    const astroLink = nav.locator('.nav__subsection-link:text("Astro")');
    await expect(astroLink).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking section header navigates to first page in section', async ({ page }) => {
    // Start on Hugo page (Site Components section)
    await page.goto('/hugo/');

    // Click Code Reviews section header — should navigate to first page
    const codeReviewsLink = page.locator('.nav__section-link:text("Code Reviews")');
    await codeReviewsLink.click();

    await expect(page).toHaveURL(/\/code-reviews\/reviewbot\/setup\//);
    const currentLink = page.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Setup');
  });

  test('clicking subsection header navigates to first child page', async ({ page }) => {
    // Start on a Debugging Tools page
    await page.goto('/debugging-tools/bughunter-pro/setup/');

    // Click StackTrace Wizard subsection header
    const stackTraceLink = page.locator('.nav__subsection-link:text("StackTrace Wizard")');
    await stackTraceLink.click();

    await expect(page).toHaveURL(/\/debugging-tools\/stacktrace-wizard\/setup\//);
    const currentLink = page.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Setup');
  });

  test('navigate from Hugo to Astro via subsection link', async ({ page }) => {
    await page.goto('/hugo/');
    // Click the Astro subsection link directly — navigates to /astro/
    const astroLink = page.locator('.nav__subsection-link:text("Astro")');
    await astroLink.click();

    await expect(page).toHaveURL(/\/astro\//);
    const currentLink = page.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Home');
  });

  test('navigate from Astro to Hugo via subsection link', async ({ page }) => {
    await page.goto('/astro/');
    // Click the Hugo subsection link directly — navigates to /hugo/
    const hugoLink = page.locator('.nav__subsection-link:text("Hugo")');
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

    // Focus the expanded section link
    const sectionLink = nav.locator('.nav__section-link:text("Site Components")');
    await sectionLink.focus();
    await expect(sectionLink).toBeFocused();

    // Tab from the section link into the children — should reach a subsection or nav link
    await page.keyboard.press('Tab');
    const focusedEl = page.locator(':focus');
    const tagName = await focusedEl.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('a');
  });

  test('Hugo rewritten route shows correct nav state (code-reviews)', async ({ page }) => {
    await page.goto('/code-reviews/reviewbot/key-features/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    // The "Code Reviews" section should be expanded
    const codeReviewsLink = nav.locator('.nav__section-link:text("Code Reviews")');
    await expect(codeReviewsLink).toHaveAttribute('aria-expanded', 'true');

    // The "ReviewBot" subsection should be expanded
    const reviewBotLink = nav.locator('.nav__subsection-link:text("ReviewBot")');
    await expect(reviewBotLink).toHaveAttribute('aria-expanded', 'true');

    // The current page link should be marked
    const currentLink = nav.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Key Features');
    await expect(currentLink).toHaveAttribute('href', '/code-reviews/reviewbot/key-features/');
  });

  test('Astro rewritten route shows correct nav state (debugging-tools)', async ({ page }) => {
    await page.goto('/debugging-tools/bughunter-pro/setup/');
    const nav = page.locator('nav[aria-label="Site navigation"]');

    // The "Debugging Tools" section should be expanded
    const debugLink = nav.locator('.nav__section-link:text("Debugging Tools")');
    await expect(debugLink).toHaveAttribute('aria-expanded', 'true');

    // The "BugHunter Pro" subsection should be expanded
    const bugHunterLink = nav.locator('.nav__subsection-link:text("BugHunter Pro")');
    await expect(bugHunterLink).toHaveAttribute('aria-expanded', 'true');

    // The current page link should be marked
    const currentLink = nav.locator('a[aria-current="page"]');
    await expect(currentLink).toHaveText('Setup');
    await expect(currentLink).toHaveAttribute('href', '/debugging-tools/bughunter-pro/setup/');
  });

  test('HTML landmarks are correct', async ({ page }) => {
    await page.goto('/hugo/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[aria-label="Site navigation"]')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
