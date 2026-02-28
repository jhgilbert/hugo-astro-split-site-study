import { test, expect } from '@playwright/test';

test.describe('Tabs Component', () => {
  for (const platform of ['hugo', 'astro'] as const) {
    test.describe(`${platform} tabs`, () => {
      test('tab switching works', async ({ page }) => {
        await page.goto(`/${platform}/tabs/`);
        const tabs = page.locator('[data-testid="tabs-two"]');
        await expect(tabs).toBeVisible();

        // Wait for hydration/JS init — ensure tab is interactive
        const firstTab = page.locator('[data-testid="tab-two-0"]');
        const secondTab = page.locator('[data-testid="tab-two-1"]');
        const firstPanel = page.locator('[data-testid="panel-two-0"]');
        const secondPanel = page.locator('[data-testid="panel-two-1"]');

        await expect(firstTab).toHaveAttribute('aria-selected', 'true');
        await expect(secondPanel).toBeHidden();

        // Click second tab and retry until interactive
        await secondTab.click();
        // For Astro, Preact hydration may take a moment; retry the assertion
        await expect(async () => {
          await secondTab.click();
          const val = await secondTab.getAttribute('aria-selected');
          expect(val).toBe('true');
        }).toPass({ timeout: 5000 });

        await expect(firstTab).toHaveAttribute('aria-selected', 'false');
        await expect(secondPanel).toBeVisible();
        await expect(firstPanel).toBeHidden();
      });

      test('keyboard navigation with arrow keys', async ({ page }) => {
        await page.goto(`/${platform}/tabs/`);
        const firstTab = page.locator('[data-testid="tab-three-0"]');
        const secondTab = page.locator('[data-testid="tab-three-1"]');
        const thirdTab = page.locator('[data-testid="tab-three-2"]');

        // Wait for interactivity
        await expect(async () => {
          await firstTab.focus();
          await page.keyboard.press('ArrowRight');
          const val = await secondTab.getAttribute('aria-selected');
          expect(val).toBe('true');
        }).toPass({ timeout: 5000 });

        await page.keyboard.press('ArrowRight');
        await expect(thirdTab).toHaveAttribute('aria-selected', 'true');

        // Home jumps to first
        await page.keyboard.press('Home');
        await expect(firstTab).toHaveAttribute('aria-selected', 'true');

        // End jumps to last
        await page.keyboard.press('End');
        await expect(thirdTab).toHaveAttribute('aria-selected', 'true');
      });

      test('ARIA attributes are correct', async ({ page }) => {
        await page.goto(`/${platform}/tabs/`);
        const tablist = page.locator('[data-testid="tabs-two"] [role="tablist"]');
        await expect(tablist).toBeVisible();

        const tab0 = page.locator('[data-testid="tab-two-0"]');
        await expect(tab0).toHaveAttribute('role', 'tab');
        await expect(tab0).toHaveAttribute('aria-controls', 'two-panel-0');

        const panel0 = page.locator('[data-testid="panel-two-0"]');
        await expect(panel0).toHaveAttribute('role', 'tabpanel');
        await expect(panel0).toHaveAttribute('aria-labelledby', 'two-tab-0');
      });
    });
  }

  test.describe('screenshots', () => {
    test('tabs before and after switch', async ({ page }) => {
      await page.goto('/astro/tabs/');
      // Wait for hydration
      await expect(async () => {
        await page.locator('[data-testid="tab-two-1"]').click();
        const val = await page.locator('[data-testid="tab-two-1"]').getAttribute('aria-selected');
        expect(val).toBe('true');
      }).toPass({ timeout: 5000 });

      // Reset to first tab for screenshot
      await page.locator('[data-testid="tab-two-0"]').click();
      await page.screenshot({ path: 'tests/e2e/screenshots/tabs-first-active.png', fullPage: true });

      await page.locator('[data-testid="tab-two-1"]').click();
      await page.screenshot({ path: 'tests/e2e/screenshots/tabs-second-active.png', fullPage: true });
    });
  });
});
