import { test, expect } from '@playwright/test';

test.describe('Collapsible Sections', () => {
  for (const platform of ['hugo', 'astro'] as const) {
    test.describe(`${platform} collapsible`, () => {
      test('toggle open and closed', async ({ page }) => {
        await page.goto(`/${platform}/collapsible/`);

        const header = page.locator('[data-testid="closed-demo-header"]');
        const content = page.locator('[data-testid="closed-demo-content"]');

        // Wait for interactivity
        await expect(async () => {
          await header.click();
          const expanded = await header.getAttribute('aria-expanded');
          expect(expanded).toBe('true');
        }).toPass({ timeout: 5000 });

        // Content region should be visible (grid-template-rows: 1fr)
        const wrapper = page.locator('[data-testid="closed-demo"]');
        await expect(wrapper).toHaveClass(/collapsible--open/);

        // Click to close
        await header.click();
        await expect(header).toHaveAttribute('aria-expanded', 'false');
        await expect(wrapper).not.toHaveClass(/collapsible--open/);
      });

      test('defaultOpen section starts open', async ({ page }) => {
        await page.goto(`/${platform}/collapsible/`);

        const header = page.locator('[data-testid="open-demo-header"]');
        const wrapper = page.locator('[data-testid="open-demo"]');

        await expect(header).toHaveAttribute('aria-expanded', 'true');
        await expect(wrapper).toHaveClass(/collapsible--open/);
      });

      test('keyboard toggle with Enter', async ({ page }) => {
        await page.goto(`/${platform}/collapsible/`);

        const header = page.locator('[data-testid="closed-demo-header"]');

        // Wait for interactivity then use keyboard
        await expect(async () => {
          await header.focus();
          await page.keyboard.press('Enter');
          const expanded = await header.getAttribute('aria-expanded');
          expect(expanded).toBe('true');
        }).toPass({ timeout: 5000 });

        // Press Enter again to close
        await page.keyboard.press('Enter');
        await expect(header).toHaveAttribute('aria-expanded', 'false');
      });

      test('ARIA attributes are correct', async ({ page }) => {
        await page.goto(`/${platform}/collapsible/`);

        const header = page.locator('[data-testid="closed-demo-header"]');
        const content = page.locator('[data-testid="closed-demo-content"]');

        // Button has aria-controls pointing to content id
        const controlsId = await header.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        await expect(content).toHaveAttribute('id', controlsId!);

        // Content has role="region" and aria-labelledby
        await expect(content).toHaveAttribute('role', 'region');
        const headerId = await header.getAttribute('id');
        await expect(content).toHaveAttribute('aria-labelledby', headerId!);
      });
    });
  }

  test.describe('screenshots', () => {
    test('collapsible before and after toggle', async ({ page }) => {
      await page.goto('/astro/collapsible/');

      // Wait for hydration
      await expect(async () => {
        await page.locator('[data-testid="closed-demo-header"]').click();
        const val = await page.locator('[data-testid="closed-demo-header"]').getAttribute('aria-expanded');
        expect(val).toBe('true');
      }).toPass({ timeout: 5000 });

      // Reset to closed for "before" screenshot
      await page.locator('[data-testid="closed-demo-header"]').click();
      await page.screenshot({ path: 'tests/e2e/screenshots/collapsible-closed.png', fullPage: true });

      // Open for "after" screenshot
      await page.locator('[data-testid="closed-demo-header"]').click();
      await page.screenshot({ path: 'tests/e2e/screenshots/collapsible-open.png', fullPage: true });
    });
  });
});
