import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function loginIntoDemoDashboard(page: Page) {
  await page.goto('./');

  await expect(page.getByText(/Preview mode is running against the built-in demo backend\./)).toBeVisible();

  await page.getByRole('button', { name: /Confirm|确定/ }).click();

  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
}

test('pages preview boots demo runtime and reaches dashboard', async ({ page }) => {
  await loginIntoDemoDashboard(page);
});

test('pages preview supports tenant switching in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  const switcherButton = page.getByRole('button', { name: /Platform|平台/ });
  await expect(switcherButton).toBeVisible();

  await switcherButton.hover();
  await page.getByText(/Main Tenant/).click();

  await expect(page.getByRole('button', { name: /Main Tenant/ })).toBeVisible();
  await expect(page).toHaveURL(/#\/dashboard$/);
});
