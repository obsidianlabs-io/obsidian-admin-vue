import './plugins/assets';
import { setupGuestApp } from './bootstrap/setup-guest-app';
import { isGuestBootstrapPath } from './bootstrap/runtime-location';

async function setupApp() {
  const demoRuntimeInstallPromise =
    import.meta.env.VITE_APP_RUNTIME === 'demo'
      ? import('@demo/runtime').then(({ installDemoRuntime }) => {
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
