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

test('pages preview can open the user drawer in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/user');

  await expect(page.getByText(/^User$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();

  await expect(modal).toBeVisible();
  await expect(modal.getByPlaceholder(/Please enter user name|请输入用户名/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Please enter email|请输入邮箱/)).toBeVisible();

  await modal
    .locator('.n-form-item')
    .filter({ hasText: /Role|角色/ })
    .locator('.n-base-selection')
    .click();

  await expect(page.locator('.n-base-select-option').filter({ hasText: /Admin/ }).first()).toBeVisible();
});

test('pages preview can toggle a feature flag in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/feature-flag');

  const featureRow = page.locator('tr', { hasText: 'menu.role' }).first();

  await expect(featureRow).toBeVisible();

  await featureRow.getByRole('switch').click();

  await expect(featureRow.getByText(/Force OFF|强制关闭/)).toBeVisible();
});
