import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/StackPDF/);
});

test('check dashboard links', async ({ page }) => {
    await page.goto('/');

    // Check if "Merge PDF" link exists and works
    const mergeLink = page.getByRole('link', { name: /Merge PDF/i });
    await expect(mergeLink).toBeVisible();

    // Navigate to Merge PDF
    await mergeLink.click();
    await expect(page).toHaveURL(/.*merge/);
});

test('footer presence', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/StackPDF/)).toBeVisible();
});
