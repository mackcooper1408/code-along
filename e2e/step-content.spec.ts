import { test, expect } from '@playwright/test';

test.describe('Step Content Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Step 1: Listening for Connections - content check', async ({ page }) => {
    await expect(page.getByText('Step 1: Listening for Connections')).toBeVisible();

    // Check for key concepts
    await expect(page.getByText(/Create a TCP server/i).first()).toBeVisible();
    await expect(page.getByText(/port 6379/i).first()).toBeVisible();

    // Check for code hints
    await expect(page.getByText(/socket.bind/i).first()).toBeVisible();
  });

  test('Step 2: Handle PING Command - content check', async ({ page }) => {
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Step 2: Handle PING Command')).toBeVisible();

    // Check for key concepts
    await expect(page.getByText(/PING command/i).first()).toBeVisible();
    await expect(page.getByText(/PONG/i).first()).toBeVisible();
    await expect(page.getByText(/RESP/i).first()).toBeVisible();
  });

  test('Step 3: Handle ECHO Command - content check', async ({ page }) => {
    // Navigate to Step 3
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText('Step 3: Handle ECHO Command')).toBeVisible();

    // Check for RESP array explanation
    await expect(page.getByText(/RESP Arrays/i).first()).toBeVisible();
    await expect(page.getByText(/Bulk String/i).first()).toBeVisible();
  });

  test('Step 4: Handle SET Command - content check', async ({ page }) => {
    // Navigate to Step 4
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText('Step 4: Handle SET Command')).toBeVisible();

    // Check for storage concepts
    await expect(page.getByText(/In-Memory Storage/i).first()).toBeVisible();
    await expect(page.getByText(/key-value pairs/i).first()).toBeVisible();
  });

  test('Step 5: Handle GET Command - content check', async ({ page }) => {
    // Navigate to Step 5
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'Next →' }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText('Step 5: Handle GET Command')).toBeVisible();

    // Check for completion message (use first() since it appears multiple times)
    await expect(page.getByText(/Congratulations/i).first()).toBeVisible();
    await expect(page.getByText(/GET/i).first()).toBeVisible();
    await expect(page.getByText(/retrieve/i).first()).toBeVisible();
  });

  test('Each step has description and instructions', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      // Each step should have a description (paragraph after title)
      const description = page.locator('p.text-slate-600.leading-relaxed');
      await expect(description).toBeVisible();

      // Each step should have detailed instructions
      const instructions = page.locator('.prose');
      await expect(instructions).toBeVisible();

      if (i < 4) {
        await page.getByRole('button', { name: 'Next →' }).click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('Code examples are properly formatted', async ({ page }) => {
    // Navigate through steps and check for code blocks
    for (let i = 0; i < 5; i++) {
      // Look for inline code elements
      const codeElements = page.locator('code');
      const count = await codeElements.count();
      expect(count).toBeGreaterThan(0);

      if (i < 4) {
        await page.getByRole('button', { name: 'Next →' }).click();
        await page.waitForTimeout(300);
      }
    }
  });
});
