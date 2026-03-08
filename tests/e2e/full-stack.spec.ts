import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function loginToPairedBackend(page: Page) {
  await page.goto("/login", { waitUntil: "networkidle" });

  await expect(page.getByText(/Password Login|密码登录/).first()).toBeVisible();

  const confirmButton = page
    .getByRole("button", { name: /Confirm|确定/ })
    .first();

  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
}

async function switchToMainTenant(page: Page) {
  const switcherButton = page
    .getByRole("button", { name: /Platform|平台/ })
    .first();

  await expect(switcherButton).toBeVisible();
  await switcherButton.hover();
  await page.getByText(/Main Tenant/).click();

  await expect(
    page.getByRole("button", { name: /Main Tenant/ }).first(),
  ).toBeVisible();
}

test("frontend pairs with seeded laravel backend for login, tenant switching, and user access", async ({
  page,
}) => {
  await loginToPairedBackend(page);
  await switchToMainTenant(page);

  await page.goto("/user");

  await expect(page.getByText(/^User$/).first()).toBeVisible();
  await expect(page.getByRole("cell", { name: "Admin" }).first()).toBeVisible();

  await page.getByRole("button", { name: /^Add$|^新增$/ }).click();

  const modal = page.locator(".n-modal").last();

  await expect(modal).toBeVisible();
  await expect(
    modal.getByPlaceholder(/Please enter user name|请输入用户名/),
  ).toBeVisible();
  await expect(
    modal.getByPlaceholder(/Please enter email|请输入邮箱/),
  ).toBeVisible();

  await modal
    .locator(".n-form-item")
    .filter({ hasText: /Role|角色/ })
    .locator(".n-base-selection")
    .click();

  await expect(
    page
      .locator(".n-base-select-option")
      .filter({ hasText: /^Admin$/ })
      .first(),
  ).toBeVisible();
});
