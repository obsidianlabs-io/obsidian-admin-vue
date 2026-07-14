import { defineComponent, h, ref } from 'vue';
import type { Component } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchGetAuditPolicyList = vi.fn();
const fetchUpdateAuditPolicy = vi.fn();

vi.mock('@/service/api', () => ({
  fetchGetAuditPolicyList,
  fetchUpdateAuditPolicy
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/constants/event', () => ({
  appEvent: { emit: vi.fn(), on: vi.fn(), off: vi.fn() }
}));

vi.mock('@/hooks/business/auth', () => ({
  useAuth: () => ({
    hasPermission: () => true,
    isSuperAdmin: ref(true)
  })
}));

vi.mock('@/hooks/business/schema-table', () => ({
  useSchemaTableColumns: vi.fn(() => ({
    columns: ref([]),
    columnChecks: ref([])
  }))
}));

vi.mock('naive-ui', () => ({
  NInputNumber: defineComponent({ name: 'NInputNumber', render: () => h('div') }),
  NSwitch: defineComponent({
    name: 'NSwitch',
    props: ['value', 'disabled'],
    emits: ['update:value'],
    render: () => h('div')
  }),
  NTag: defineComponent({ name: 'NTag', render: () => h('span') })
}));

vi.mock('@/components/advanced/table-wrapper.vue', () => ({
  default: defineComponent({ name: 'TableWrapper', render: () => h('div') })
}));

vi.mock('@/components/advanced/table-header-operation.vue', () => ({
  default: defineComponent({ name: 'TableHeaderOperation', render: () => h('div') })
}));

describe('audit-policy index page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGetAuditPolicyList.mockResolvedValue({
      data: {
        records: [
          {
            action: 'user.login',
            category: 'mandatory',
            mandatory: true,
            locked: true,
            description: 'User login event',
            effective: { enabled: true, samplingRate: 1.0, retentionDays: 365, source: 'default' },
            defaultEnabled: true,
            defaultSamplingRate: 1.0,
            defaultRetentionDays: 365
          },
          {
            action: 'user.locale.update',
            category: 'optional',
            mandatory: false,
            locked: false,
            description: 'User locale update',
            effective: { enabled: false, samplingRate: 1.0, retentionDays: 90, source: 'default' },
            defaultEnabled: false,
            defaultSamplingRate: 1.0,
            defaultRetentionDays: 90
          }
        ],
        total: 2
      }
    });
  });

  it('should mount and fetch audit policy list on init', async () => {
    const AuditPolicyPage = (await import('@/views/audit-policy/index.vue')).default;

    const wrapper = mount(AuditPolicyPage as unknown as Component, {
      global: {
        stubs: {
          AuditPolicySearch: defineComponent({ name: 'AuditPolicySearch', render: () => h('div') })
        }
      }
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(fetchGetAuditPolicyList).toHaveBeenCalled();
  });

  it('should handle API error gracefully', async () => {
    fetchGetAuditPolicyList.mockRejectedValue(new Error('Network error'));

    const AuditPolicyPage = (await import('@/views/audit-policy/index.vue')).default;

    const wrapper = mount(AuditPolicyPage as unknown as Component, {
      global: {
        stubs: {
          AuditPolicySearch: defineComponent({ name: 'AuditPolicySearch', render: () => h('div') })
        }
      }
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });
});
