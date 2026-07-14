import { defineComponent, h, ref } from 'vue';
import type { Component } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchFeatureFlags = vi.fn();
const toggleFeatureFlag = vi.fn();
const purgeFeatureFlag = vi.fn();

vi.mock('@/service/api/feature-flag', () => ({
  fetchFeatureFlags,
  toggleFeatureFlag,
  purgeFeatureFlag
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/constants/event', () => ({
  appEvent: { emit: vi.fn(), on: vi.fn(), off: vi.fn() }
}));

vi.mock('@/hooks/common/table', () => ({
  defaultTransform: (response: any) => response,
  useNaivePaginatedTable: vi.fn(() => ({
    columns: ref([]),
    columnChecks: ref([]),
    data: ref([]),
    getData: vi.fn(),
    getDataByPage: vi.fn(),
    loading: ref(false),
    mobilePagination: ref({})
  }))
}));

vi.mock('naive-ui', () => ({
  NButton: defineComponent({ name: 'NButton', render: () => h('button') }),
  NPopconfirm: defineComponent({ name: 'NPopconfirm', render: () => h('div') }),
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

describe('feature-flag index page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchFeatureFlags.mockResolvedValue({
      data: { records: [], total: 0, current: 1, size: 10 }
    });
  });

  it('should mount without errors', async () => {
    const FeatureFlagsPage = (await import('@/views/feature-flag/index.vue')).default;

    const wrapper = mount(FeatureFlagsPage as unknown as Component, {
      global: {
        stubs: {
          FeatureFlagSearch: defineComponent({ name: 'FeatureFlagSearch', render: () => h('div') })
        }
      }
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('should handle API error gracefully', async () => {
    fetchFeatureFlags.mockRejectedValue(new Error('Network error'));

    const FeatureFlagsPage = (await import('@/views/feature-flag/index.vue')).default;

    const wrapper = mount(FeatureFlagsPage as unknown as Component, {
      global: {
        stubs: {
          FeatureFlagSearch: defineComponent({ name: 'FeatureFlagSearch', render: () => h('div') })
        }
      }
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });
});
