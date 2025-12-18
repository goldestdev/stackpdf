import { test, expect } from '@playwright/test';
import path from 'path';

test('organize tool loads and allows file upload', async ({ page }) => {
    await page.goto('/organize');

    // Expect dropzone to be visible
    await expect(page.getByText(/Drag & drop a PDF/i)).toBeVisible({ timeout: 15000 });

    // Create a file chooser interceptor
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Click the dropzone (triggers file chooser)
    await page.getByText(/Drag & drop a PDF/i).click();
    const fileChooser = await fileChooserPromise;

    // Upload the dummy PDF
    await fileChooser.setFiles(path.join(__dirname, 'fixtures/test.pdf'));

    // Should show "Loading pages..." or eventually the page thumbnail
    // Since our dummy PDF is small, it should load fast
    // We can check for "Page 1" text or the thumbnail image presence
    await expect(page.getByText('Page 1')).toBeVisible();
});
