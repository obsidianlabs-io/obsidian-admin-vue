import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { appEvent } from '@/constants/event';
import { useTenantChanged } from '@/hooks/business/tenant-change';

describe('useTenantChanged', () => {
  it('registers and cleans up the tenant-changed window listener', async () => {
    const handler = vi.fn();

    const TestComponent = defineComponent({
      name: 'TenantChangedHookHarness',
      setup() {
        useTenantChanged(handler);

        return () => h('div');
      }
    });

    const wrapper = mount(TestComponent);

    window.dispatchEvent(new Event(appEvent.tenantChanged));
    await nextTick();

    expect(handler).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    window.dispatchEvent(new Event(appEvent.tenantChanged));
    await nextTick();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
