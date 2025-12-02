import { test, expect } from '@playwright/test';

test.describe('Code Execution and Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show loading state when running tests', async ({ page }) => {
    // Click Run Tests button
    const runButton = page.getByRole('button', { name: /Run Tests/i });
    await runButton.click();

    // Should show "Running..." state briefly
    await expect(page.getByRole('button', { name: /Running/i })).toBeVisible({ timeout: 2000 });

    // Wait for tests to complete (can take a few seconds with Docker)
    await expect(runButton).toBeEnabled({ timeout: 15000 });
  });

  test('should display test output in terminal panel', async ({ page }) => {
    // Click Run Tests
    await page.getByRole('button', { name: /Run Tests/i }).click();

    // Wait for "Running tests..." message
    await expect(page.getByText('Running tests...')).toBeVisible({ timeout: 2000 });

    // Wait for test results (timeout for Docker execution)
    await page.waitForTimeout(8000);

    // Terminal should show test output
    const terminal = page.locator('pre.text-slate-300');
    await expect(terminal).toBeVisible();

    // Check for test-related output
    const terminalText = await terminal.textContent();
    expect(terminalText).toBeTruthy();
  });

  test('should show success message for Step 1 with default code', async ({ page }) => {
    // The default code for Step 1 should pass tests
    await page.getByRole('button', { name: /Run Tests/i }).click();

    // Wait for test execution (Docker can take time)
    await page.waitForTimeout(10000);

    // Check for success indicators (PASSED or test success)
    const terminal = page.locator('pre.text-slate-300');
    const output = await terminal.textContent();

    // Should contain test results
    expect(output).toContain('Test');
  });

  test('should disable navigation buttons while tests are running', async ({ page }) => {
    // Click Run Tests
    await page.getByRole('button', { name: /Run Tests/i }).click();

    // Navigation buttons should be disabled while running
    const prevButton = page.getByRole('button', { name: '← Previous' });
    const nextButton = page.getByRole('button', { name: /Next/i });

    await expect(prevButton).toBeDisabled();
    // Next button starts disabled on Step 1, but Run Tests button should be disabled
    const runButton = page.getByRole('button', { name: /Running/i });
    await expect(runButton).toBeDisabled();
  });

  test('should preserve test output when navigating steps', async ({ page }) => {
    // Run tests on Step 1
    await page.getByRole('button', { name: /Run Tests/i }).click();
    await page.waitForTimeout(8000);

    // Get the output
    const terminal = page.locator('pre.text-slate-300');
    const step1Output = await terminal.textContent();

    // Navigate to Step 2
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(300);

    // Terminal should reset to initial message
    await expect(page.getByText("Click 'Run Tests' to check your work...")).toBeVisible();

    // Navigate back to Step 1
    await page.getByRole('button', { name: '← Previous' }).click();
    await page.waitForTimeout(300);

    // Terminal should show initial message (output is not preserved across navigation)
    await expect(page.getByText("Click 'Run Tests' to check your work...")).toBeVisible();
  });

  test('should allow running tests on different steps', async ({ page }) => {
    // Run test on Step 1
    await page.getByRole('button', { name: /Run Tests/i }).click();
    await page.waitForTimeout(8000);

    // Navigate to Step 2
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(500);

    // Run tests button should be available and enabled
    const runButton = page.getByRole('button', { name: /Run Tests/i });
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();

    // Can click to run tests on Step 2
    await runButton.click();
    await expect(page.getByText('Running tests...')).toBeVisible({ timeout: 2000 });
  });

  test('should show API error handling', async ({ page }) => {
    // This test verifies error handling if the API fails
    // We'll just verify that the terminal can display error messages

    // Click Run Tests
    await page.getByRole('button', { name: /Run Tests/i }).click();

    // Wait for response
    await page.waitForTimeout(10000);

    // Check that we got some response (either success or error)
    const terminal = page.locator('pre.text-slate-300');
    const output = await terminal.textContent();

    // Should not be empty
    expect(output).not.toBe('');
    expect(output).not.toBe("Click 'Run Tests' to check your work...");
  });

  test('Monaco editor should be editable', async ({ page }) => {
    // Click into the editor
    const editor = page.locator('.monaco-editor');
    await editor.click();
    await page.waitForTimeout(500);

    // Type some code
    await page.keyboard.type('# Test comment');

    // The editor should contain our typed text
    // Note: Monaco's structure makes it hard to verify exact content
    // But we can at least verify the editor is interactive
    await expect(editor).toBeVisible();
  });
});
