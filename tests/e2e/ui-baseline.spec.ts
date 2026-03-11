import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const KNOWN_A11Y_BASELINE_EXCEPTIONS = [
  {
    id: 'aria-required-attr',
    targets: ['.n-card-header[role="heading"]', '.n-card-header__main[role="heading"]']
  },
  {
    id: 'button-name',
    targets: ['.n-button', 'button[is-dark="false"]', '.text-20px', '.text-icon']
  },
  {
    id: 'image-alt',
    targets: ['> img']
  },
  {
    id: 'label',
    targets: ['input[placeholder=""]']
  }
];

async function loginIntoDemoDashboard(page: Page) {
  await page.goto('./');

  await expect(page.getByText(/Preview mode is running against the built-in demo backend\./)).toBeVisible();

  await page.getByRole('button', { name: /Confirm|确定/ }).click();
  await expect(page).toHaveURL(/#\/dashboard$/);
  await expect(page.getByText(/Dashboard|仪表盘/).first()).toBeVisible();
  await page.waitForLoadState('networkidle');
}

async function waitForLoginSurfaceReady(page: Page) {
  await expect(page.getByText(/Preview mode is running against the built-in demo backend\./)).toBeVisible();

  await page.waitForFunction(() => {
    const parseRgb = (value: string) => value.match(/\d+/g)?.slice(0, 3).map(Number) ?? [];
    const loginForm = document.querySelector('.n-form');

    if (!loginForm) {
      return false;
    }

    const loginFormStyle = getComputedStyle(loginForm);

    if (loginFormStyle.opacity !== '1' || loginForm.className.includes('fade-enter-active')) {
      return false;
    }

    const isReadable = (selector: string) => {
      const element = document.querySelector(selector);

      if (!element) {
        return false;
      }

      const [red, green, blue] = parseRgb(getComputedStyle(element).color);

      return [red, green, blue].every(channel => typeof channel === 'number' && channel < 140);
    };

    return isReadable('.n-checkbox__label') && isReadable('.n-divider__title');
  });
}

async function openUserDrawer(page: Page): Promise<Locator> {
  await page.goto('./#/user');
  await expect(page.getByText(/^User$/).first()).toBeVisible();
  await page.getByRole('button', { name: /^Add$|^新增$/ }).click();

  const modal = page.locator('.n-modal').last();
  await expect(modal).toBeVisible();
  await expect(modal.getByPlaceholder(/Please enter user name|请输入用户名/)).toBeVisible();

  return modal;
}

async function expectNoSeriousOrCriticalViolations(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']);

  if (include) {
    builder.include(include);
  }

  const results = await builder.analyze();
  const violations = results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact ?? ''));

  const unexpectedViolations = violations
    .map(violation => ({
      ...violation,
      nodes: violation.nodes.filter(node => !isKnownViolationNode(violation.id, node.target))
    }))
    .filter(violation => violation.nodes.length > 0);

  expect(unexpectedViolations, JSON.stringify(unexpectedViolations, null, 2)).toEqual([]);
}

function isKnownViolationNode(id: string, targets: readonly unknown[]): boolean {
  const normalizedTargets = targets.map(target => (Array.isArray(target) ? target.join(' ') : String(target)));

  return KNOWN_A11Y_BASELINE_EXCEPTIONS.some(exception => {
    if (exception.id !== id) {
      return false;
    }

    return normalizedTargets.some(target => exception.targets.some(pattern => target.includes(pattern)));
  });
}

test('preview landing screen has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('./');
  await waitForLoginSurfaceReady(page);

  await expectNoSeriousOrCriticalViolations(page, '#app');
});

test('preview user drawer closes by keyboard and has no serious or critical modal violations', async ({ page }) => {
  await loginIntoDemoDashboard(page);
  const modal = await openUserDrawer(page);

  await expectNoSeriousOrCriticalViolations(page, '.n-modal');

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('preview user list matches the visual baseline', async ({ page }) => {
  await loginIntoDemoDashboard(page);
  await page.goto('./#/user');
  await expect(page.getByText(/^User$/).first()).toBeVisible();

  await expect(page).toHaveScreenshot('preview-user-list-page.png');
});

test('preview user drawer matches the visual baseline', async ({ page }) => {
  await loginIntoDemoDashboard(page);
  const modal = await openUserDrawer(page);

  await expect(modal).toHaveScreenshot('preview-user-drawer.png');
});
