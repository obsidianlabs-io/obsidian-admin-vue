import { expect, test } from '@playwright/test';
import { registerMockApi } from './support/mock-api';

test('user can register through backend-aligned flow', async ({ page }) => {
  await registerMockApi(page);

  await page.goto('/login/register');

  await page.getByPlaceholder(/Please enter user name|请输入用户名/).fill('E2EUser');
  await page.getByPlaceholder(/Please enter email|请输入邮箱/).fill('register@example.com');
  await page.getByPlaceholder(/^Please enter password$|^请输入密码$/).fill('Abc12345');
  await page.getByPlaceholder(/Please enter password again|请再次输入密码/).fill('Abc12345');

  await page.getByRole('button', { name: /Confirm|确定/ }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
});

test('user can request reset token and reset password', async ({ page }) => {
  await registerMockApi(page);

  await page.goto('/login/reset-pwd');

  await page.getByPlaceholder(/Please enter email|请输入邮箱/).fill('super@soybean.local');
  await page.getByRole('button', { name: /Send reset link|发送重置链接/ }).click();

  const tokenInput = page.getByPlaceholder(/Please enter reset token|请输入重置令牌/);

  await expect(tokenInput).toBeVisible();
  await expect(tokenInput).toHaveValue('reset-token-1');

  await page.getByPlaceholder(/^Please enter password$|^请输入密码$/).fill('NewAbc12345');
  await page.getByPlaceholder(/Please enter password again|请再次输入密码/).fill('NewAbc12345');
  await page.getByRole('button', { name: /Reset password|重置密码/ }).click();

  await expect(page).toHaveURL(/\/login\/pwd-login/);
  await expect(page.getByText(/Password Login|密码登录/).first()).toBeVisible();
});
