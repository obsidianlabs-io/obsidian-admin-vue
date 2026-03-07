import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCreateTenant = vi.fn();
const fetchUpdateTenant = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();
const restoreValidation = vi.fn();
const success = vi.fn();

vi.mock('@/service/api', () => ({
  fetchCreateTenant,
  fetchUpdateTenant
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

const TenantOperateDrawer = (await import('@/views/tenant/modules/tenant-operate-drawer.vue')).default;

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
        ),
        h(
          'button',
          {
            'data-testid': 'modal-close',
            onClick: () => emit('close')
          },
          'close'
        )
      ]);
  }
});

const FormStub = defineComponent({
  name: 'NForm',
  setup(_, { attrs, slots }) {
    return () => h('form', attrs, slots.default?.());
  }
});

const FormItemStub = defineComponent({
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

const FormItemGiStub = defineComponent({
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

const GridStub = defineComponent({
  name: 'NGrid',
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.());
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
        value: props.value,
        onInput: (event: Event) => emit('update:value', (event.target as HTMLInputElement).value)
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

const TagStub = defineComponent({
  name: 'NTag',
  setup(_, { attrs, slots }) {
    return () => h('span', attrs, slots.default?.());
  }
});

function mountComponent(options?: {
  operateType?: 'add' | 'edit';
  readOnly?: boolean;
  rowData?: Api.Tenant.TenantRecord | null;
  visible?: boolean;
}) {
  return mount(TenantOperateDrawer, {
    props: {
      visible: options?.visible ?? true,
      operateType: options?.operateType ?? 'add',
      readOnly: options?.readOnly ?? false,
      rowData: options?.rowData ?? null
    },
    global: {
      stubs: {
        FormModalWrapper: FormModalWrapperStub as Component,
        NForm: FormStub as Component,
        NFormItem: FormItemStub as Component,
        NFormItemGi: FormItemGiStub as Component,
        NGrid: GridStub as Component,
        NInput: InputStub as Component,
        NRadioGroup: RadioGroupStub as Component,
        NRadio: RadioStub as Component,
        NTag: TagStub as Component
      }
    }
  });
}

describe('TenantOperateDrawer', () => {
  beforeEach(() => {
    fetchCreateTenant.mockReset();
    fetchUpdateTenant.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();
    restoreValidation.mockReset();
    success.mockReset();

    validate.mockResolvedValue(undefined);
    applyServerValidation.mockResolvedValue(true);
    fetchCreateTenant.mockResolvedValue({ error: undefined });
    fetchUpdateTenant.mockResolvedValue({ error: undefined });

    Object.assign(window, {
      $message: {
        success
      }
    });
  });

  it('submits a trimmed create payload and emits submitted on success', async () => {
    const wrapper = mountComponent();

    const inputs = wrapper.findAll('input');

    expect(inputs).toHaveLength(2);

    await inputs[0].setValue(' TENANT-CODE ');
    await inputs[1].setValue(' Main Tenant ');
    await nextTick();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await nextTick();

    expect(validate).toHaveBeenCalledTimes(1);
    expect(fetchCreateTenant).toHaveBeenCalledWith(
      {
        tenantCode: 'TENANT-CODE',
        tenantName: 'Main Tenant',
        status: '1'
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
    expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  });

  it('routes backend field errors into the shared form adapter without emitting submitted', async () => {
    const backendError = {
      response: {
        data: {
          data: {
            errors: {
              tenantCode: ['Tenant code already exists.']
            }
          }
        }
      }
    };

    fetchCreateTenant.mockResolvedValueOnce({ error: backendError });

    const wrapper = mountComponent();
    const inputs = wrapper.findAll('input');

    await inputs[0].setValue('DUPLICATE');
    await inputs[1].setValue('Main Tenant');
    await nextTick();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await nextTick();

    expect(fetchCreateTenant).toHaveBeenCalledTimes(1);
    expect(applyServerValidation).toHaveBeenCalledWith(backendError);
    expect(success).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });

  it('submits the edit flow through update api and keeps tenant code read-only', async () => {
    const rowData = {
      id: 42,
      tenantCode: 'MAIN',
      tenantName: 'Main Tenant',
      status: '2'
    } as Api.Tenant.TenantRecord;

    const wrapper = mountComponent({
      operateType: 'edit',
      rowData,
      visible: false
    });

    await wrapper.setProps({ visible: true });
    await nextTick();

    const inputs = wrapper.findAll('input');

    expect(inputs).toHaveLength(2);
    expect((inputs[0].element as HTMLInputElement).readOnly).toBe(true);
    expect((inputs[0].element as HTMLInputElement).value).toBe('MAIN');

    await inputs[1].setValue(' Updated Tenant ');
    await nextTick();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await nextTick();

    expect(fetchUpdateTenant).toHaveBeenCalledWith(
      42,
      {
        tenantCode: 'MAIN',
        tenantName: 'Updated Tenant',
        status: '2'
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.updateSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });
});
