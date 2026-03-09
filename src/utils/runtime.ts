export type AppRuntime = 'backend' | 'demo';

export function isEnvFlagEnabled(value: CommonType.YesOrNo | undefined, defaultValue = false): boolean {
  if (value === 'Y') {
    return true;
  }

  if (value === 'N') {
    return false;
  }

  return defaultValue;
}

export function resolveAppRuntime(env: Partial<Env.ImportMeta>): AppRuntime {
  return env.VITE_APP_RUNTIME === 'demo' ? 'demo' : 'backend';
}

export function isDemoRuntime(env: Partial<Env.ImportMeta>): boolean {
  return resolveAppRuntime(env) === 'demo';
}
