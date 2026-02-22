import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyBooleanSetting,
  applyEnumSetting,
  clampInteger,
  isLayoutMode,
  isPageAnimateMode,
  isScrollMode,
  isThemeScheme
} from '../src/store/modules/theme/remote-utils';

test('theme remote utils validate enum values', () => {
  assert.equal(isThemeScheme('dark'), true);
  assert.equal(isThemeScheme('invalid'), false);
  assert.equal(isLayoutMode('vertical'), true);
  assert.equal(isLayoutMode('card'), false);
  assert.equal(isScrollMode('content'), true);
  assert.equal(isScrollMode('page'), false);
  assert.equal(isPageAnimateMode('fade'), true);
  assert.equal(isPageAnimateMode('slide'), false);
});

test('theme remote utils apply constrained values', () => {
  assert.equal(clampInteger(12.8, 0, 16), 12);
  assert.equal(clampInteger('abc', 0, 16), null);

  let boolValue = false;
  applyBooleanSetting(true, value => {
    boolValue = value;
  });
  assert.equal(boolValue, true);

  let enumValue = 'light';
  applyEnumSetting(
    'dark',
    (value): value is 'light' | 'dark' => value === 'light' || value === 'dark',
    value => {
      enumValue = value;
    }
  );
  assert.equal(enumValue, 'dark');
});
