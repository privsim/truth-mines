import { test, expect } from '@playwright/test';

test.describe('Truth Mines Basic Navigation', () => {
  test('loads application', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Truth Mines')).toBeVisible();
  });

  test('toggles between 2D and 3D views', async ({ page }) => {
    await page.goto('/');

    // Should start with 2D view
    await expect(page.getByText('2D Graph View')).toBeVisible();

    // Click 3D view button
    await page.getByRole('button', { name: '3D View' }).click();
    await expect(page.getByText('3D Truth Mine View')).toBeVisible();

    // Toggle back to 2D
    await page.getByRole('button', { name: '2D View' }).click();
    await expect(page.getByText('2D Graph View')).toBeVisible();
  });

  test('view buttons show active state', async ({ page }) => {
    await page.goto('/');

    const button2D = page.getByRole('button', { name: '2D View' });
    const button3D = page.getByRole('button', { name: '3D View' });

    // 2D should be active initially
    await expect(button2D).toHaveClass(/active/);

    // Click 3D
    await button3D.click();
    await expect(button3D).toHaveClass(/active/);
    await expect(button2D).not.toHaveClass(/active/);
  });
});
