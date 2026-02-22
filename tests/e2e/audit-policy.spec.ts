import { expect, test } from '@playwright/test';
import { registerMockApi } from './support/mock-api';

test('audit policy table renders records', async ({ page }) => {
  await registerMockApi(page);

  await page.goto('/login');
  await page.getByRole('button', { name: /Confirm|确认/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/audit-policy');
  await expect(page.getByText('audit.policy.update')).toBeVisible();
  await expect(page.getByText(/Update audit policy|更新审计策略/)).toBeVisible();
});
