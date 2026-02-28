import { test, expect } from '@playwright/test';

const platforms = [
  { name: 'Hugo', url: '/hugo/' },
  { name: 'Astro', url: '/astro/' },
];

for (const platform of platforms) {
  test.describe(`Token Editor — ${platform.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(platform.url);
    });

    test('toggle button opens and closes the panel', async ({ page }) => {
      const toggleBtn = page.locator('#token-editor-toggle');
      await expect(toggleBtn).toBeVisible();
      await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

      // Open
      await toggleBtn.click();
      const panel = page.locator('#token-editor-panel');
      await expect(panel).toHaveAttribute('data-open', '');
      await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

      // Close
      await toggleBtn.click();
      await expect(panel).not.toHaveAttribute('data-open');
      await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('panel shows token groups with correct labels', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      const panel = page.locator('#token-editor-panel');

      const groups = panel.locator('.token-editor__group > summary');
      const groupLabels = await groups.allTextContents();

      expect(groupLabels).toContain('Primary & Secondary');
      expect(groupLabels).toContain('Grays');
      expect(groupLabels).toContain('Semantic Colors');
      expect(groupLabels).toContain('Alert Colors');
      expect(groupLabels).toContain('Code Syntax');
      expect(groupLabels).toContain('Typography');
      expect(groupLabels).toContain('Spacing');
      expect(groupLabels).toContain('Border Radius');
      expect(groupLabels).toContain('Transitions');
      expect(groupLabels).toContain('Shadows');
      expect(groupLabels).toContain('Layout');
    });

    test('color tokens have color picker inputs', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      const panel = page.locator('#token-editor-panel');

      const colorInput = panel.locator('input[data-token="--color-primary"]');
      await expect(colorInput).toHaveAttribute('type', 'color');
    });

    test('text tokens have text inputs', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      const panel = page.locator('#token-editor-panel');

      const textInput = panel.locator('input[data-token="--space-md"]');
      await expect(textInput).toHaveAttribute('type', 'text');
    });

    test('editing a color token changes the computed style', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();

      const colorInput = page.locator('input[data-token="--color-primary"]');
      await colorInput.fill('#ff0000');
      await colorInput.dispatchEvent('input');

      const value = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
      );
      expect(value).toBe('#ff0000');
    });

    test('editing a text token changes the computed style', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();

      const textInput = page.locator('input[data-token="--space-md"]');
      await textInput.fill('2rem');
      await textInput.dispatchEvent('input');

      const value = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--space-md').trim()
      );
      expect(value).toBe('2rem');
    });

    test('reset button restores original value', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();

      // Get original value
      const originalValue = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--space-md').trim()
      );

      // Change the value
      const textInput = page.locator('input[data-token="--space-md"]');
      await textInput.fill('99rem');
      await textInput.dispatchEvent('input');

      // The field should be marked as modified
      const field = page.locator('.token-editor__field[data-token="--space-md"]');
      await expect(field).toHaveClass(/token-editor__field--modified/);

      // Click the reset button
      const resetBtn = field.locator('.token-editor__reset');
      await resetBtn.click();

      // Value should be restored
      const restoredValue = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--space-md').trim()
      );
      expect(restoredValue).toBe(originalValue);
      await expect(field).not.toHaveClass(/token-editor__field--modified/);
    });

    test('reset all button clears all overrides', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();

      // Modify two tokens in the same visible group to avoid scrolling issues
      const primaryInput = page.locator('input[data-token="--color-primary"]');
      await primaryInput.fill('#ff0000');
      await primaryInput.dispatchEvent('input');

      const secondaryInput = page.locator('input[data-token="--color-secondary"]');
      await secondaryInput.fill('#00ff00');
      await secondaryInput.dispatchEvent('input');

      // Both fields should be modified
      await expect(page.locator('.token-editor__field--modified')).toHaveCount(2);

      // Click Reset All (in the panel header, always visible)
      await page.locator('.token-editor__reset-all').click();

      // No fields should be modified
      await expect(page.locator('.token-editor__field--modified')).toHaveCount(0);
    });

    test('Escape key closes the panel', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      const panel = page.locator('#token-editor-panel');
      await expect(panel).toHaveAttribute('data-open', '');

      await page.keyboard.press('Escape');
      await expect(panel).not.toHaveAttribute('data-open');

      // Focus should return to the toggle button
      await expect(page.locator('#token-editor-toggle')).toBeFocused();
    });

    test('close button closes the panel', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      const panel = page.locator('#token-editor-panel');
      await expect(panel).toHaveAttribute('data-open', '');

      await panel.locator('.token-editor__close').click();
      await expect(panel).not.toHaveAttribute('data-open');
      await expect(page.locator('#token-editor-toggle')).toBeFocused();
    });

    test('panel has correct ARIA attributes', async ({ page }) => {
      const toggleBtn = page.locator('#token-editor-toggle');
      await expect(toggleBtn).toHaveAttribute('aria-controls', 'token-editor-panel');

      await toggleBtn.click();
      const panel = page.locator('#token-editor-panel');
      await expect(panel).toHaveAttribute('role', 'dialog');
      await expect(panel).toHaveAttribute('aria-label', 'Design token editor');
    });

    test('focus moves to close button when panel opens', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();
      await expect(page.locator('.token-editor__close')).toBeFocused();
    });

    test('panel reflects dark mode changes', async ({ page }) => {
      await page.locator('#token-editor-toggle').click();

      // Read current primary color
      const lightValue = await page.locator('input[data-token="--color-primary"]').inputValue();

      // Toggle dark mode
      await page.locator('#theme-toggle').click();

      // Wait for the MutationObserver refresh
      await page.waitForTimeout(100);

      // Primary color should change in dark mode
      const darkValue = await page.locator('input[data-token="--color-primary"]').inputValue();
      expect(darkValue).not.toBe(lightValue);

      // Toggle back to restore state
      await page.locator('#theme-toggle').click();
    });
  });
}
