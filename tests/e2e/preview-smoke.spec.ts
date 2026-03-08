import { expect, test } from '@playwright/test';

test('pages preview boots demo runtime and reaches dashboard', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByText(/Preview mode is running against the built-in demo backend\./)).toBeVisible();

  await page.getByRole('button', { name: /Confirm|确定/ }).click();

  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
});
