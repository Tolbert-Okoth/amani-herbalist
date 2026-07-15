import { test, expect } from '@playwright/test';

test.describe('Fohow Eden Life UI Verification', () => {
  
  test('Checkout page renders correctly on Desktop', async ({ page }) => {
    // 1. Go to the checkout page
    await page.goto('/checkout');

    // 2. Verify the exact Title/Branding exists
    await expect(page.getByText('Secure 254 Checkout')).toBeVisible({ timeout: 10000 });

    // 3. Verify the Form Steps exist
    await expect(page.getByRole('heading', { name: 'Contact Info' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Delivery Details' })).toBeVisible();

    // 4. Verify the 47 Counties Dropdown loaded successfully
    const countyDropdown = page.locator('select#county');
    await expect(countyDropdown).toBeVisible();
  });

});
