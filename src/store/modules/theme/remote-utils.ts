export function isThemeScheme(value: unknown): value is UnionKey.ThemeScheme {
  return value === 'light' || value === 'dark' || value === 'auto';
}

export function isLayoutMode(value: unknown): value is UnionKey.ThemeLayoutMode {
  return (
    value === 'vertical' ||
    value === 'horizontal' ||
    value === 'vertical-mix' ||
    value === 'vertical-hybrid-header-first' ||
    value === 'top-hybrid-sidebar-first' ||
    value === 'top-hybrid-header-first'
  );
}

export function isScrollMode(value: unknown): value is UnionKey.ThemeScrollMode {
  return value === 'wrapper' || value === 'content';
}

export function isPageAnimateMode(value: unknown): value is UnionKey.ThemePageAnimateMode {
  return (
    value === 'fade' ||
    value === 'fade-slide' ||
    value === 'fade-bottom' ||
    value === 'fade-scale' ||
    value === 'zoom-fade' ||
    value === 'zoom-out' ||
    value === 'none'
  );
}

export function clampInteger(value: unknown, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.min(max, Math.max(min, Math.trunc(numeric)));
}

export function applyBooleanSetting(value: unknown, setter: (next: boolean) => void) {
  if (typeof value === 'boolean') {
    setter(value);
  }
}

export function applyEnumSetting<T>(value: unknown, guard: (input: unknown) => input is T, setter: (next: T) => void) {
  if (guard(value)) {
    setter(value);
  }
}
