import { test, expect } from '@playwright/test';

test.describe('Code Blocks', () => {
  for (const platform of ['hugo', 'astro'] as const) {
    test.describe(`${platform} code blocks`, () => {
      test('code blocks render with syntax highlighting', async ({ page }) => {
        await page.goto(`/${platform}/code-blocks/`);

        // Verify all 5 language sections exist
        const headings = page.locator('h2');
        await expect(headings).toHaveCount(5);

        // Verify code blocks contain pre > code elements
        const codeBlocks = page.locator('pre code');
        const count = await codeBlocks.count();
        expect(count).toBeGreaterThanOrEqual(5);
      });

      test('code blocks have colored tokens (not plain text)', async ({ page }) => {
        await page.goto(`/${platform}/code-blocks/`);

        // Hugo Chroma uses CSS classes on spans; Astro Shiki uses inline style="color:..."
        // Check for either approach — both indicate syntax highlighting is active
        const chromaSpans = page.locator('pre code span[class]');
        const shikiSpans = page.locator('pre code span[style*="color"]');
        const chromaCount = await chromaSpans.count();
        const shikiCount = await shikiSpans.count();
        expect(chromaCount + shikiCount).toBeGreaterThan(0);
      });

      test('code blocks render all languages', async ({ page }) => {
        await page.goto(`/${platform}/code-blocks/`);

        // Check that we can find expected code content
        const pageContent = await page.textContent('main');
        expect(pageContent).toContain('fibonacci');
        expect(pageContent).toContain('dataclass');
        expect(pageContent).toContain('DOCTYPE');
        expect(pageContent).toContain('http.HandleFunc');
        expect(pageContent).toContain('set -euo pipefail');
      });
    });
  }

  test.describe('dark mode', () => {
    test('code blocks switch to dark theme colors', async ({ page }) => {
      await page.goto('/astro/code-blocks/');
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      // Verify the dark mode code background is applied
      const codeBlock = page.locator('pre').first();
      const bg = await codeBlock.evaluate((el) => getComputedStyle(el).backgroundColor);
      // Dark mode background should not be white/light
      expect(bg).not.toBe('rgb(255, 255, 255)');
    });
  });

  test.describe('screenshots', () => {
    test('code blocks light and dark mode', async ({ page }) => {
      await page.goto('/astro/code-blocks/');
      // Wait for content to render
      await expect(page.locator('pre code').first()).toBeVisible();

      await page.screenshot({ path: 'tests/e2e/screenshots/code-blocks-light.png', fullPage: true });

      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      await page.screenshot({ path: 'tests/e2e/screenshots/code-blocks-dark.png', fullPage: true });
    });
  });
});
