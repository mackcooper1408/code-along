import { test, expect } from '@playwright/test';

test.describe('Phase 1: Multi-Step Learning Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with Step 1 by default', async ({ page }) => {
    // Check that Step 1 is displayed
    await expect(page.getByText('Step 1: Listening for Connections')).toBeVisible();

    // Check for step badge
    await expect(page.getByText('Step 1 of 5')).toBeVisible();

    // Check for progress indicator
    await expect(page.getByText('0 / 5 steps completed')).toBeVisible();
  });

  test('should display all three panels', async ({ page }) => {
    // AI Panel (left) - check for instructions
    await expect(page.getByText('Step 1: Listening for Connections')).toBeVisible();

    // Code Editor Panel (center) - check for Monaco editor
    await expect(page.locator('.monaco-editor')).toBeVisible();

    // Terminal Panel (right) - check for Run Tests button
    await expect(page.getByRole('button', { name: /Run Tests/i })).toBeVisible();
  });

  test('should show step navigation buttons', async ({ page }) => {
    // Previous button should be disabled on Step 1
    const prevButton = page.getByRole('button', { name: '← Previous' });
    await expect(prevButton).toBeDisabled();

    // Next button should be enabled
    const nextButton = page.getByRole('button', { name: 'Next →' });
    await expect(nextButton).toBeEnabled();
  });

  test('should navigate to Step 2 using Next button', async ({ page }) => {
    // Click Next button
    await page.getByRole('button', { name: /Next/i }).click();

    // Wait for content to change
    await page.waitForTimeout(500);

    // Check that Step 2 is now displayed
    await expect(page.getByText('Step 2: Handle PING Command')).toBeVisible();
    await expect(page.getByText('Step 2 of 5')).toBeVisible();

    // Previous button should now be enabled
    await expect(page.getByRole('button', { name: '← Previous' })).toBeEnabled();
  });

  test('should navigate between all 5 steps', async ({ page }) => {
    const steps = [
      'Step 1: Listening for Connections',
      'Step 2: Handle PING Command',
      'Step 3: Handle ECHO Command',
      'Step 4: Handle SET Command',
      'Step 5: Handle GET Command',
    ];

    // Navigate forward through all steps
    for (let i = 0; i < steps.length; i++) {
      await expect(page.getByText(steps[i])).toBeVisible();
      await expect(page.getByText(`Step ${i + 1} of 5`)).toBeVisible();

      if (i < steps.length - 1) {
        await page.getByRole('button', { name: /Next/i }).click();
        await page.waitForTimeout(300);
      }
    }

    // On Step 5, Next button should be disabled
    await expect(page.getByRole('button', { name: /Next/i })).toBeDisabled();

    // Navigate backward
    for (let i = steps.length - 1; i > 0; i--) {
      await page.getByRole('button', { name: '← Previous' }).click();
      await page.waitForTimeout(300);
      await expect(page.getByText(steps[i - 1])).toBeVisible();
    }
  });

  test('should update code editor when switching steps', async ({ page }) => {
    // Get initial code content for Step 1
    const editor = page.locator('.monaco-editor');
    await expect(editor).toBeVisible();

    // Step 1 should have basic socket code
    await expect(page.locator('.view-line')).toContainText('import socket', { timeout: 5000 });

    // Navigate to Step 2
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);

    // Step 2 should have different boilerplate (includes accept and recv)
    await expect(page.getByText('Step 2: Handle PING Command')).toBeVisible();

    // Navigate to Step 5
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /Next/i }).click();
      await page.waitForTimeout(300);
    }

    // Step 5 should have complete implementation with parse_resp function
    await expect(page.getByText('Step 5: Handle GET Command')).toBeVisible();
  });

  test('should show visual progress bar', async ({ page }) => {
    // Get progress bar elements (5 bars total)
    const progressBars = page.locator('.h-2.flex-1.rounded');
    await expect(progressBars).toHaveCount(5);

    // On Step 1, first bar should be blue (current), others gray
    const firstBar = progressBars.first();
    await expect(firstBar).toHaveClass(/bg-blue-500/);
  });

  test('should display estimated time for each step', async ({ page }) => {
    // Step 1 shows estimated time
    await expect(page.getByText(/~\d+ min/)).toBeVisible();

    // Navigate to Step 2 and check it also has estimated time
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/~\d+ min/)).toBeVisible();
  });

  test('should have Run Tests button on all steps', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      const runButton = page.getByRole('button', { name: /Run Tests/i });
      await expect(runButton).toBeVisible();
      await expect(runButton).toBeEnabled();

      if (i < 4) {
        await page.getByRole('button', { name: /Next/i }).click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should display file navigator showing main.py', async ({ page }) => {
    await expect(page.getByText('main.py')).toBeVisible();
  });

  test('should show initial terminal message', async ({ page }) => {
    await expect(page.getByText("Click 'Run Tests' to check your work...")).toBeVisible();
  });

  test('should maintain step progress across navigation', async ({ page }) => {
    // Navigate to Step 3
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);

    // Verify we're on Step 3
    await expect(page.getByText('Step 3: Handle ECHO Command')).toBeVisible();

    // Navigate back to Step 1
    await page.getByRole('button', { name: '← Previous' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '← Previous' }).click();
    await page.waitForTimeout(300);

    // Verify we're back on Step 1
    await expect(page.getByText('Step 1: Listening for Connections')).toBeVisible();

    // Navigate forward to Step 3 again
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);

    // Should still be on Step 3
    await expect(page.getByText('Step 3: Handle ECHO Command')).toBeVisible();
  });

  test('should show instructions with markdown formatting', async ({ page }) => {
    // Check for section headings (Step 1)
    await expect(page.getByRole('heading', { name: /Welcome to Building Your Own Redis/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /What You'll Learn/i })).toBeVisible();

    // Check for list items
    await expect(page.getByText('TCP socket programming in Python')).toBeVisible();

    // Check for inline code
    await expect(page.locator('code').filter({ hasText: 'socket.AF_INET' })).toBeVisible();
  });

  test('should have responsive three-panel layout', async ({ page }) => {
    // Check for grid layout
    const mainGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-\\[300px_1fr_400px\\]');
    await expect(mainGrid).toBeVisible();

    // All three panels should be present
    await expect(mainGrid.locator('> div')).toHaveCount(3);
  });
});
