import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCreateOrganization = vi.fn();
const fetchUpdateOrganization = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();
const restoreValidation = vi.fn();
const success = vi.fn();

vi.mock('@/service/api', () => ({
  fetchCreateOrganization,
  fetchUpdateOrganization
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/hooks/common/form', () => ({
  useFormRules: () => ({
    defaultRequiredRule: {
      required: true
    }
  }),
  useNaiveForm: () => ({
    applyServerValidation,
    bindModelValidation,
    clearServerValidationErrors: vi.fn(),
    formRef: ref(null),
    restoreValidation,
    serverValidationErrors: ref({}),
    validate,
    withServerValidationRules: vi.fn(() => computed(() => ({})))
  })
}));

const OrganizationOperateDrawer = (await import('@/views/organization/modules/organization-operate-drawer.vue'))
  .default;

const FormModalWrapperStub = defineComponent({
  name: 'FormModalWrapper',
  props: {
    title: {
      type: String,
      default: ''
    },
    readOnly: Boolean,
    visible: Boolean
  },
  emits: ['submit', 'close', 'update:visible'],
  setup(props, { emit, slots }) {
    return () =>
      h('section', { 'data-testid': 'form-modal-wrapper', 'data-title': props.title }, [
        h('div', { 'data-testid': 'modal-body' }, slots.default?.()),
        h(
          'button',
          {
            'data-testid': 'modal-submit',
            onClick: () => emit('submit')
          },
          'submit'
        )
      ]);
  }
});

const passthroughStub = (name: string) =>
  defineComponent({
    name,
    setup(_, { attrs, slots }) {
      return () => h('div', attrs, slots.default?.());
    }
  });

const FormItemStub = defineComponent({
  name: 'NFormItemGi',
  props: {
    path: {
      type: String,
      default: ''
    }
  },
  setup(props, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-path': props.path }, slots.default?.());
  }
});

const FormItemSingleStub = defineComponent({
  name: 'NFormItem',
  props: {
    path: {
      type: String,
      default: ''
    }
  },
  setup(props, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-path': props.path }, slots.default?.());
  }
});

const InputStub = defineComponent({
  name: 'NInput',
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    readonly: Boolean,
    type: {
      type: String,
      default: 'text'
    },
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        placeholder: props.placeholder,
        readonly: props.readonly,
        type: props.type,
        value: props.value,
        onInput: (event: Event) => emit('update:value', (event.target as HTMLInputElement).value)
      });
  }
});

const InputNumberStub = defineComponent({
  name: 'NInputNumber',
  props: {
    value: {
      type: Number,
      default: null
    },
    min: {
      type: Number,
      default: undefined
    },
    max: {
      type: Number,
      default: undefined
    }
  },
  emits: ['update:value'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        type: 'number',
        min: props.min,
        max: props.max,
        value: props.value ?? '',
        onInput: (event: Event) => emit('update:value', Number((event.target as HTMLInputElement).value))
      });
  }
});

const RadioGroupStub = defineComponent({
  name: 'NRadioGroup',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-value': props.value,
          onUpdateValue: (value: string) => emit('update:value', value)
        },
        slots.default?.()
      );
  }
});

const RadioStub = defineComponent({
  name: 'NRadio',
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { 'data-radio-value': props.value }, props.label);
  }
});

function mountComponent(options?: {
  operateType?: 'add' | 'edit';
  rowData?: Api.Organization.OrganizationRecord | null;
  visible?: boolean;
}) {
  return mount(OrganizationOperateDrawer, {
    props: {
      visible: options?.visible ?? false,
      operateType: options?.operateType ?? 'add',
      rowData: options?.rowData ?? null
    },
    global: {
      stubs: {
        FormModalWrapper: FormModalWrapperStub as Component,
        NForm: passthroughStub('NForm') as Component,
        NGrid: passthroughStub('NGrid') as Component,
        NFormItemGi: FormItemStub as Component,
        NFormItem: FormItemSingleStub as Component,
        NInput: InputStub as Component,
        NInputNumber: InputNumberStub as Component,
        NRadioGroup: RadioGroupStub as Component,
        NRadio: RadioStub as Component,
        NTag: passthroughStub('NTag') as Component
      }
    }
  });
}

async function flushUi() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe('OrganizationOperateDrawer', () => {
  beforeEach(() => {
    fetchCreateOrganization.mockReset();
    fetchUpdateOrganization.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();
    restoreValidation.mockReset();
    success.mockReset();

    validate.mockResolvedValue(undefined);
    applyServerValidation.mockResolvedValue(true);
    fetchCreateOrganization.mockResolvedValue({ error: undefined });
    fetchUpdateOrganization.mockResolvedValue({ error: undefined });

    Object.assign(window, {
      $message: {
        success
      }
    });
  });

  it('submits a trimmed add payload through create organization', async () => {
    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    await inputs[0].setValue(' ORG-HQ ');
    await inputs[1].setValue(' Headquarters ');
    await inputs[2].setValue('8');
    await inputs[3].setValue(' Main branch ');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateOrganization).toHaveBeenCalledWith(
      {
        organizationCode: 'ORG-HQ',
        organizationName: 'Headquarters',
        description: 'Main branch',
        status: '1',
        sort: 8
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits the edit flow through update organization and keeps code read-only', async () => {
    const rowData = {
      id: 3,
      organizationCode: 'ORG-HQ',
      organizationName: 'Headquarters',
      description: 'Main branch',
      status: '2',
      sort: 5,
      createTime: '2026-03-08 00:00:00',
      updateTime: '2026-03-08 00:00:00'
    } as Api.Organization.OrganizationRecord;

    const wrapper = mountComponent({ operateType: 'edit', rowData });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    expect((inputs[0].element as HTMLInputElement).readOnly).toBe(true);
    expect((inputs[0].element as HTMLInputElement).value).toBe('ORG-HQ');

    await inputs[1].setValue(' HQ Updated ');
    await inputs[2].setValue('6');
    await inputs[3].setValue(' Updated desc ');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchUpdateOrganization).toHaveBeenCalledWith(
      3,
      {
        organizationCode: 'ORG-HQ',
        organizationName: 'HQ Updated',
        description: 'Updated desc',
        status: '2',
        sort: 6
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.updateSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('routes backend validation errors into the shared form adapter', async () => {
    const backendError = {
      response: {
        data: {
          data: {
            errors: {
              organizationCode: ['The organization code has already been taken.']
            }
          }
        }
      }
    };

    fetchCreateOrganization.mockResolvedValueOnce({ error: backendError });

    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    await inputs[0].setValue('ORG-HQ');
    await inputs[1].setValue('Headquarters');
    await inputs[2].setValue('8');
    await inputs[3].setValue('Main branch');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateOrganization).toHaveBeenCalledTimes(1);
    expect(applyServerValidation).toHaveBeenCalledWith(backendError);
    expect(success).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
