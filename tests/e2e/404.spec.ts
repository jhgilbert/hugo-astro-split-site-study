import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test('renders for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');

    const errorPage = page.locator('[data-testid="error-page"]');
    await expect(errorPage).toBeVisible();
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });

  test('includes links back to home pages', async ({ page }) => {
    await page.goto('/this-does-not-exist');

    const hugoLink = page.locator('a[href="/hugo/"]');
    const astroLink = page.locator('a[href="/astro/"]');

    await expect(hugoLink).toBeVisible();
    await expect(astroLink).toBeVisible();
  });

  test('uses site styling', async ({ page }) => {
    await page.goto('/this-does-not-exist');

    // Verify the page has styled content (not raw text)
    const errorCode = page.locator('.error-page__code');
    await expect(errorCode).toBeVisible();
    await expect(errorCode).toHaveText('404');

    // Check that CSS is applied (the code should be styled with primary color)
    const color = await errorCode.evaluate((el) => getComputedStyle(el).color);
    // Primary color should be applied (blue-ish, not default black)
    expect(color).not.toBe('rgb(0, 0, 0)');
  });

  test('home links navigate to working pages', async ({ page }) => {
    await page.goto('/this-does-not-exist');

    await page.locator('a[href="/hugo/"]').click();
    await expect(page).toHaveURL(/\/hugo\//);

    // Verify the Hugo page loaded correctly
    await expect(page.locator('main')).toBeVisible();
  });
});
