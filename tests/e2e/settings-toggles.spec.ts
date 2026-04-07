import { test, expect } from '@playwright/test';

test.describe('Settings Toggles', () => {
  test('dark mode toggle sets data-theme attribute', async ({ page }) => {
    await page.goto('/hugo/');
    const html = page.locator('html');

    // Initially no dark mode
    await expect(html).not.toHaveAttribute('data-theme', 'dark');

    // Click dark mode toggle
    await page.click('#theme-toggle');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Click again to turn off
    await page.click('#theme-toggle');
    await expect(html).not.toHaveAttribute('data-theme', 'dark');
  });

  test('dark mode persists after page reload', async ({ page }) => {
    await page.goto('/hugo/');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('dark mode persists across Hugo to Astro navigation', async ({ page }) => {
    await page.goto('/hugo/');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Click the Astro subsection link to navigate
    await page.locator('.nav__subsection-link:text("Astro")').click();
    await expect(page).toHaveURL(/\/astro\//);

    // Dark mode should persist
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('density toggle sets data-density attribute', async ({ page }) => {
    await page.goto('/hugo/');
    const html = page.locator('html');

    await expect(html).not.toHaveAttribute('data-density', 'compact');

    await page.click('#density-toggle');
    await expect(html).toHaveAttribute('data-density', 'compact');

    await page.click('#density-toggle');
    await expect(html).not.toHaveAttribute('data-density', 'compact');
  });

  test('toggles are keyboard accessible', async ({ page }) => {
    await page.goto('/hugo/');

    // Focus the density toggle
    const densityToggle = page.locator('#density-toggle');
    await densityToggle.focus();
    await expect(densityToggle).toBeFocused();

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');

    // Focus the theme toggle
    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Press Space to toggle
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test.describe('screenshots', () => {
    test('light vs dark mode', async ({ page }) => {
      await page.goto('/astro/debugging-tools/stacktrace-wizard/setup');
      await page.screenshot({ path: 'tests/e2e/screenshots/settings-light.png', fullPage: true });

      await page.click('#theme-toggle');
      await page.screenshot({ path: 'tests/e2e/screenshots/settings-dark.png', fullPage: true });
    });

    test('standard vs compact spacing', async ({ page }) => {
      await page.goto('/astro/debugging-tools/stacktrace-wizard/setup');
      await page.screenshot({ path: 'tests/e2e/screenshots/settings-standard.png', fullPage: true });

      await page.click('#density-toggle');
      await page.screenshot({ path: 'tests/e2e/screenshots/settings-compact.png', fullPage: true });
    });
  });
});
