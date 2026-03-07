import { defineComponent, h } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

const TenantSearch = (await import('@/views/tenant/modules/tenant-search.vue')).default;

const ButtonStub = defineComponent({
  name: 'NButton',
  emits: ['click'],
  setup(_, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          onClick: (event: MouseEvent) => emit('click', event)
        },
        slots.default?.()
      );
  }
});

const InputStub = defineComponent({
  name: 'NInput',
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value', 'keyup.enter'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        placeholder: props.placeholder,
        value: props.value,
        onInput: (event: Event) => emit('update:value', (event.target as HTMLInputElement).value),
        onKeyup: (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            emit('keyup.enter', event);
          }
        }
      });
  }
});

const SelectStub = defineComponent({
  name: 'NSelect',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  setup(props, { attrs }) {
    return () =>
      h('select', {
        ...attrs,
        'aria-label': props.placeholder,
        value: props.value
      });
  }
});

const passthroughStubs: Record<string, Component> = {
  NCard: defineComponent({
    name: 'NCard',
    setup(_, { attrs, slots }) {
      return () => h('section', attrs, slots.default?.());
    }
  }),
  NCollapse: defineComponent({
    name: 'NCollapse',
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  }),
  NCollapseItem: defineComponent({
    name: 'NCollapseItem',
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  }),
  NForm: defineComponent({
    name: 'NForm',
    setup(_, { attrs, slots }) {
      return () => h('form', attrs, slots.default?.());
    }
  }),
  NFormItemGi: defineComponent({
    name: 'NFormItemGi',
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  }),
  NGrid: defineComponent({
    name: 'NGrid',
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  }),
  NSpace: defineComponent({
    name: 'NSpace',
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  }),
  'icon-mdi-restore': defineComponent({
    name: 'IconRestore',
    setup() {
      return () => h('span');
    }
  }),
  'icon-ic-round-search': defineComponent({
    name: 'IconSearch',
    setup() {
      return () => h('span');
    }
  })
};

describe('TenantSearch', () => {
  it('wires reset and search buttons to the shared search-form actions', async () => {
    const model = {
      keyword: 'initial-keyword',
      status: '2' as Api.Common.EnableStatus
    };

    const wrapper = mount(TenantSearch, {
      props: {
        model
      },
      global: {
        stubs: {
          ...passthroughStubs,
          NButton: ButtonStub,
          NInput: InputStub,
          NSelect: SelectStub
        }
      }
    });

    model.keyword = 'changed-keyword';
    model.status = '1';

    const resetButton = wrapper.findAll('button').find(button => button.text().includes('common.reset'));
    const searchButton = wrapper.findAll('button').find(button => button.text().includes('common.search'));

    expect(resetButton).toBeDefined();
    expect(searchButton).toBeDefined();

    await resetButton!.trigger('click');

    expect(model).toEqual({
      keyword: 'initial-keyword',
      status: '2'
    });
    expect(wrapper.emitted('search')).toHaveLength(1);

    await searchButton!.trigger('click');

    expect(wrapper.emitted('search')).toHaveLength(2);
  });
});
