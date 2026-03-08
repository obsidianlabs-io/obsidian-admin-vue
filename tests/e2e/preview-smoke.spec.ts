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

test('pages preview can load the audit log table in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/audit');

  await expect(page.getByText(/^Audit Logs$|^审计日志$/).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'auth.login' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'demo-login-1' }).first()).toBeVisible();
});

test('pages preview can open the audit detail modal in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/audit');

  await expect(page.getByText(/^Audit Logs$|^审计日志$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^View$|^查看$/ }).first().click();

  const modal = page.locator('.n-modal').last();

  await expect(modal).toBeVisible();
  await expect(modal.getByText(/auth.login/).first()).toBeVisible();
  await expect(modal.getByText(/Super/).first()).toBeVisible();
  await expect(modal.getByText(/127.0.0.1/).first()).toBeVisible();
  await expect(modal.locator('textarea').last()).toHaveValue(/Demo Runtime/);
});

test('pages preview can open the language drawer in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/language');

  await expect(page.getByText(/^Language$|^语言管理$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();

  await expect(modal).toBeVisible();
  await expect(modal.getByText(/^Add Translation$|^新增翻译$/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Ex: route.user \/ common.search|例如：route.user \/ common.search/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Translation text shown in UI|界面显示的翻译文本/)).toBeVisible();
});

test('pages preview can save a language record in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/language');

  await expect(page.getByText(/^Language$|^语言管理$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();
  const translationKey = 'preview.language.smoke';
  const translationValue = 'Preview language smoke';

  await modal.getByPlaceholder(/Ex: route.user \/ common.search|例如：route.user \/ common.search/).fill(translationKey);
  await modal.getByPlaceholder(/Translation text shown in UI|界面显示的翻译文本/).fill(translationValue);
  await modal.getByRole('button', { name: /^Confirm$|^确定$/ }).click();

  await expect(modal).toBeHidden();
  await expect(page.getByRole('cell', { name: translationKey }).first()).toBeVisible();
});

test('pages preview can open the language edit drawer in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/language');

  await expect(page.getByText(/^Language$|^语言管理$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Edit$|^编辑$/ }).first().click();

  const modal = page.locator('.n-modal').last();
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/^Edit Translation$|^编辑翻译$/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Ex: route.user \/ common.search|例如：route.user \/ common.search/)).toHaveValue(
    'login.button'
  );
  await expect(modal.locator('textarea').first()).toHaveValue(/Login|登录/);
});

test('pages preview can save an organization record in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/organization');

  await expect(page.getByText(/^Organization$|^组织$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();
  const organizationCode = 'ORG_PREVIEW_SMOKE';
  const organizationName = 'Preview Organization';

  await expect(modal).toBeVisible();
  await modal.getByPlaceholder(/Ex: ORG_MAIN_HQ|例如：ORG_MAIN_HQ/).fill(organizationCode);
  await modal.getByPlaceholder(/Ex: Main HQ|例如：主组织/).fill(organizationName);
  await modal.getByRole('button', { name: /^Confirm$|^确定$/ }).click();

  await expect(modal).toBeHidden();
  await expect(page.getByRole('cell', { name: organizationCode }).first()).toBeVisible();
});

test('pages preview can open the organization edit drawer in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/organization');

  await expect(page.getByText(/^Organization$|^组织$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Edit$|^编辑$/ }).first().click();

  const modal = page.locator('.n-modal').last();

  await expect(modal).toBeVisible();
  await expect(modal.getByText(/^Edit Organization$|^编辑组织$/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Ex: ORG_MAIN_HQ|例如：ORG_MAIN_HQ/)).toHaveValue('ORG_MAIN_HQ');
  await expect(modal.getByPlaceholder(/Ex: Main HQ|例如：主组织/)).toHaveValue('Main HQ');
});

test('pages preview can save a team record in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/team');

  await expect(page.getByText(/^Team$|^团队$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();
  const teamCode = 'TEAM_PREVIEW_SMOKE';
  const teamName = 'Preview Team';

  await expect(modal).toBeVisible();
  await modal.getByPlaceholder(/Ex: TEAM_MAIN_PLATFORM|例如：TEAM_MAIN_PLATFORM/).fill(teamCode);
  await modal.getByPlaceholder(/Ex: Main Platform Team|例如：主平台团队/).fill(teamName);
  await modal.getByRole('button', { name: /^Confirm$|^确定$/ }).click();

  await expect(modal).toBeHidden();
  await expect(page.getByRole('cell', { name: teamCode }).first()).toBeVisible();
});

test('pages preview can open the team edit drawer in demo runtime', async ({ page }) => {
  await loginIntoDemoDashboard(page);

  await page.goto('./#/team');

  await expect(page.getByText(/^Team$|^团队$/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Edit$|^编辑$/ }).first().click();

  const modal = page.locator('.n-modal').last();

  await expect(modal).toBeVisible();
  await expect(modal.getByText(/^Edit Team$|^编辑团队$/)).toBeVisible();
  await expect(modal.getByPlaceholder(/Ex: TEAM_MAIN_PLATFORM|例如：TEAM_MAIN_PLATFORM/)).toHaveValue(
    'TEAM_MAIN_PLATFORM'
  );
  await expect(modal.getByPlaceholder(/Ex: Main Platform Team|例如：主平台团队/)).toHaveValue('Main Platform Team');
});
