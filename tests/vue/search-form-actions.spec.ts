import { defineComponent, h, ref } from 'vue';
import type { Ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { useSearchFormActions } from '@/hooks/business/search-form';

describe('useSearchFormActions', () => {
  it('restores the initial search model snapshot and triggers search on reset', () => {
    const onSearch = vi.fn();

    const TestComponent = defineComponent({
      name: 'SearchFormActionsHarness',
      setup(_, { expose }) {
        const model = ref({
          filters: {
            status: 'active'
          },
          keyword: '',
          selectedIds: ['1']
        });
        const actions = useSearchFormActions(model, onSearch);

        expose({
          actions,
          model
        });

        return () => h('div');
      }
    });

    const wrapper = mount(TestComponent);
    const exposed = wrapper.vm.$.exposed as {
      actions: ReturnType<
        typeof useSearchFormActions<{
          filters: { status: string };
          keyword: string;
          selectedIds: string[];
        }>
      >;
      model: Ref<{
        filters: { status: string };
        keyword: string;
        selectedIds: string[];
      }>;
    };

    exposed.model.value.keyword = 'tenant-admin';
    exposed.model.value.filters.status = 'inactive';
    exposed.model.value.selectedIds.push('2');

    exposed.actions.reset();

    expect(exposed.model.value).toEqual({
      filters: {
        status: 'active'
      },
      keyword: '',
      selectedIds: ['1']
    });
    expect(onSearch).toHaveBeenCalledTimes(1);

    exposed.actions.search();

    expect(onSearch).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
