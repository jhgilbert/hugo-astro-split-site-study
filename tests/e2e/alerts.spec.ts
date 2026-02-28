import { test, expect } from '@playwright/test';

const alertTypes = ['info', 'warning', 'error', 'success'] as const;
const urgentTypes = ['error', 'warning'];

test.describe('Alert Component', () => {
  for (const platform of ['hugo', 'astro'] as const) {
    test.describe(`${platform} alerts`, () => {
      test('all alert types render', async ({ page }) => {
        await page.goto(`/${platform}/alerts/`);

        for (const type of alertTypes) {
          const alert = page.locator(`[data-testid="alert-${type}"]`);
          await expect(alert).toBeVisible();
          await expect(alert).toHaveClass(new RegExp(`alert--${type}`));
        }
      });

      test('correct ARIA roles', async ({ page }) => {
        await page.goto(`/${platform}/alerts/`);

        for (const type of alertTypes) {
          const alert = page.locator(`[data-testid="alert-${type}"]`);
          const expectedRole = urgentTypes.includes(type) ? 'alert' : 'status';
          await expect(alert).toHaveAttribute('role', expectedRole);
        }
      });
    });
  }

  test.describe('screenshots', () => {
    test('Hugo alerts', async ({ page }) => {
      await page.goto('/hugo/alerts/');
      await page.screenshot({ path: 'tests/e2e/screenshots/alerts-hugo.png', fullPage: true });
    });

    test('Astro alerts', async ({ page }) => {
      await page.goto('/astro/alerts/');
      await page.screenshot({ path: 'tests/e2e/screenshots/alerts-astro.png', fullPage: true });
    });

    test('alerts in dark mode', async ({ page }) => {
      await page.goto('/hugo/alerts/');
      await page.click('#theme-toggle');
      await page.screenshot({ path: 'tests/e2e/screenshots/alerts-dark.png', fullPage: true });
    });
  });
});
