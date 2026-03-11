import './plugins/assets';
import { setupGuestApp } from './bootstrap/setup-guest-app';
import { isDemoRuntime } from './utils/runtime';
import { isGuestBootstrapPath } from './bootstrap/runtime-location';

async function setupApp() {
  const demoRuntimeInstallPromise = isDemoRuntime(import.meta.env)
    ? import('./demo/runtime').then(({ installDemoRuntime }) => {
        installDemoRuntime();
      })
    : null;

  if (isGuestBootstrapPath()) {
    await setupGuestApp();

    if (demoRuntimeInstallPromise) {
      await demoRuntimeInstallPromise;
    }

    return;
  }

  if (demoRuntimeInstallPromise) {
    await demoRuntimeInstallPromise;
  }

  const { setupAdminApp } = await import('./bootstrap/setup-admin-app');
  await setupAdminApp();
}

setupApp();
