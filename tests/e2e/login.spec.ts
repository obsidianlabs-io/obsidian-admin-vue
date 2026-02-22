import { expect, test } from '@playwright/test';
import { registerMockApi } from './support/mock-api';

test('user can login successfully', async ({ page }) => {
  await registerMockApi(page);

  await page.goto('/login');
  await page.getByRole('button', { name: /Confirm|确认/ }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
});
