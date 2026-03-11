export type AppBootstrapMode = 'admin' | 'guest';

let activeBootstrapMode: AppBootstrapMode = 'admin';

export function setActiveBootstrapMode(mode: AppBootstrapMode) {
  activeBootstrapMode = mode;
}

export function getActiveBootstrapMode() {
  return activeBootstrapMode;
}

export function isGuestBootstrapMode() {
  return activeBootstrapMode === 'guest';
}
