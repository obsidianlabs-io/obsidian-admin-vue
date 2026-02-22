import { expect, test } from '@playwright/test';
import { registerMockApi } from './support/mock-api';

test('admin can create user with role assignment', async ({ page }) => {
  await registerMockApi(page);

  await page.goto('/login');
  await page.getByRole('button', { name: /Confirm|确认/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/user');
  await expect(page.getByText(/^User$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();
  await expect(modal).toBeVisible();

  await modal.getByPlaceholder(/Please enter user name|请输入用户名/).fill('E2E User');
  await modal.getByPlaceholder(/Please enter email|请输入邮箱/).fill('e2e-user@example.com');
  await modal.getByPlaceholder(/Please enter password|请输入密码/).fill('Abc12345');
  await modal.getByPlaceholder(/Please confirm password|请确认密码/).fill('Abc12345');

  await modal
    .locator('.n-form-item')
    .filter({ hasText: /Role|角色/ })
    .locator('.n-base-selection')
    .click();
  await page.locator('.n-base-select-option').filter({ hasText: 'Admin' }).first().click();

  await modal.getByRole('button', { name: /Confirm|确认/ }).click();

  await expect(page.getByText(/Total 2 items|共 2 条/)).toBeVisible();
});
