import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { appEvent } from '@/constants/event';

interface RealtimeUpdatePayload {
  topic: string;
  action: string;
  context?: Record<string, unknown>;
  actorUserId?: number | null;
  tenantId?: number | null;
  sentAt?: string;
}

const SYSTEM_CHANNEL_NAME = 'system.updates';
const SYSTEM_EVENT_NAME = '.system.realtime.updated';

const globalWindow = window as typeof window & { Pusher?: typeof Pusher };
globalWindow.Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;
let isSystemChannelBound = false;

function realtimeEnabled() {
  return (import.meta.env.VITE_REALTIME_ENABLED ?? 'Y') === 'Y';
}

function createEchoInstance(token?: string) {
  if (!realtimeEnabled()) {
    return null;
  }

  const wsPort = Number(import.meta.env.VITE_REVERB_PORT ?? 6001);
  const wsScheme = (import.meta.env.VITE_REVERB_SCHEME ?? 'http').toLowerCase();
  const wsHost = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname;
  const appKey = import.meta.env.VITE_REVERB_APP_KEY ?? 'obsidian-reverb-key';

  return new Echo({
    broadcaster: 'reverb',
    key: appKey,
    wsHost,
    wsPort,
    wssPort: wsPort,
    forceTLS: wsScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    }
  });
}

function bindSystemChannel() {
  if (!echoInstance || isSystemChannelBound) {
    return;
  }

  echoInstance.channel(SYSTEM_CHANNEL_NAME).listen(SYSTEM_EVENT_NAME, (payload: unknown) => {
    const detail = payload as RealtimeUpdatePayload;
    window.dispatchEvent(new CustomEvent(appEvent.systemRealtimeUpdated, { detail }));
  });

  isSystemChannelBound = true;
}

export function connectRealtime(token?: string) {
  if (!realtimeEnabled()) {
    return;
  }

  if (!echoInstance) {
    echoInstance = createEchoInstance(token);
  }

  bindSystemChannel();
}

export function disconnectRealtime() {
  if (!echoInstance) {
    return;
  }

  echoInstance.leave(SYSTEM_CHANNEL_NAME);
  echoInstance.disconnect();
  echoInstance = null;
  isSystemChannelBound = false;
}
