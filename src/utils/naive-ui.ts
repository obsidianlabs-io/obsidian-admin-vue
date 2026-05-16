import type {
  DialogProviderInst,
  LoadingBarProviderInst,
  MessageProviderInst,
  NotificationProviderInst
} from 'naive-ui';

let loadingBarProvider: LoadingBarProviderInst | null = null;
let dialogProvider: DialogProviderInst | null = null;
let messageProvider: MessageProviderInst | null = null;
let notificationProvider: NotificationProviderInst | null = null;

export function registerNaiveProviders(providers: {
  loadingBar?: LoadingBarProviderInst;
  dialog?: DialogProviderInst;
  message?: MessageProviderInst;
  notification?: NotificationProviderInst;
}): void {
  if (providers.loadingBar) loadingBarProvider = providers.loadingBar;
  if (providers.dialog) dialogProvider = providers.dialog;
  if (providers.message) messageProvider = providers.message;
  if (providers.notification) notificationProvider = providers.notification;
}

export function getNaiveLoadingBar(): LoadingBarProviderInst | null {
  return loadingBarProvider;
}

export function getNaiveDialog(): DialogProviderInst | null {
  return dialogProvider;
}

export function getNaiveMessage(): MessageProviderInst | null {
  return messageProvider;
}

export function getNaiveNotification(): NotificationProviderInst | null {
  return notificationProvider;
}
