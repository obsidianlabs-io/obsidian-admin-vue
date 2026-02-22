import { onBeforeUnmount, onMounted } from 'vue';
import { appEvent } from '@/constants/event';

export function useTenantChanged(handler: () => void) {
  onMounted(() => {
    window.addEventListener(appEvent.tenantChanged, handler);
  });

  onBeforeUnmount(() => {
    window.removeEventListener(appEvent.tenantChanged, handler);
  });
}
