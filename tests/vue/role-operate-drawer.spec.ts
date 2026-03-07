import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCreateRole = vi.fn();
const fetchGetRoleAssignablePermissions = vi.fn();
const fetchUpdateRole = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();
const restoreValidation = vi.fn();
const success = vi.fn();

vi.mock('@/service/api', () => ({
  fetchCreateRole,
  fetchGetRoleAssignablePermissions,
  fetchUpdateRole
}));

vi.mock('@/locales', () => ({
  $t: (key: string, params?: Record<string, string>) => {
    if (!params) {
      return key;
    }

    return `${key}:${JSON.stringify(params)}`;
  }
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

const RoleOperateDrawer = (await import('@/views/role/modules/role-operate-drawer.vue')).default;

const FormModalWrapperStub = defineComponent({
  name: 'FormModalWrapper',
  props: {
    title: {
      type: String,
      default: ''
    },
    readOnly: Boolean,
    visible: Boolean,
    wrapperClass: {
      type: String,
      default: ''
    }
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

const CheckboxStub = defineComponent({
  name: 'NCheckbox',
  props: {
    checked: Boolean,
    label: {
      type: String,
      default: ''
    }
  },
  emits: ['update:checked'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h('label', attrs, [
        h('input', {
          type: 'checkbox',
          checked: props.checked,
          onChange: (event: Event) => emit('update:checked', (event.target as HTMLInputElement).checked)
        }),
        slots.default?.() ?? props.label
      ]);
  }
});

function mountComponent(options?: {
  operateType?: 'add' | 'edit';
  rowData?: Api.Role.RoleRecord | null;
  visible?: boolean;
  actorRoleLevel?: number | null;
}) {
  return mount(RoleOperateDrawer, {
    props: {
      visible: options?.visible ?? false,
      operateType: options?.operateType ?? 'add',
      rowData: options?.rowData ?? null,
      actorRoleLevel: options?.actorRoleLevel ?? 999
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
        NTag: passthroughStub('NTag') as Component,
        NButton: passthroughStub('NButton') as Component,
        NButtonGroup: passthroughStub('NButtonGroup') as Component,
        NDivider: passthroughStub('NDivider') as Component,
        NCheckbox: CheckboxStub as Component,
        NCheckboxGroup: passthroughStub('NCheckboxGroup') as Component,
        NCollapse: passthroughStub('NCollapse') as Component,
        NCollapseItem: passthroughStub('NCollapseItem') as Component,
        NSpace: passthroughStub('NSpace') as Component
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

describe('RoleOperateDrawer', () => {
  beforeEach(() => {
    fetchCreateRole.mockReset();
    fetchGetRoleAssignablePermissions.mockReset();
    fetchUpdateRole.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();
    restoreValidation.mockReset();
    success.mockReset();

    validate.mockResolvedValue(undefined);
    applyServerValidation.mockResolvedValue(true);
    fetchCreateRole.mockResolvedValue({ error: undefined });
    fetchUpdateRole.mockResolvedValue({ error: undefined });
    fetchGetRoleAssignablePermissions.mockResolvedValue({
      data: {
        records: [
          { permissionCode: 'user.view', permissionName: 'View User', group: 'user' },
          { permissionCode: 'user.manage', permissionName: 'Manage User', group: 'user' }
        ]
      },
      error: undefined
    });

    Object.assign(window, {
      $message: {
        success
      }
    });
  });

  it('submits a trimmed add payload through create role', async () => {
    const wrapper = mountComponent({ operateType: 'add', actorRoleLevel: 900 });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    expect(inputs.length).toBeGreaterThanOrEqual(3);

    await inputs[0].setValue(' R_MANAGER ');
    await inputs[1].setValue(' Regional Manager ');
    await inputs[2].setValue('250');
    await flushUi();

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchGetRoleAssignablePermissions).toHaveBeenCalledTimes(1);
    expect(fetchCreateRole).toHaveBeenCalledTimes(1);
    expect(fetchCreateRole.mock.calls[0]?.[1]).toEqual({
      handleValidationErrorLocally: true
    });
    expect(fetchCreateRole.mock.calls[0]?.[0]).toMatchObject({
      roleCode: 'R_MANAGER',
      roleName: 'Regional Manager',
      level: 250,
      description: '',
      status: '1'
    });
    expect(fetchCreateRole.mock.calls[0]?.[0]?.permissionCodes).toContain('user.view');
    expect(success).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits the edit flow through update role and keeps role code read-only', async () => {
    const rowData = {
      id: 9,
      roleCode: 'R_ADMIN',
      roleName: 'Tenant Admin',
      level: 500,
      description: 'old desc',
      status: '2',
      permissionCodes: ['user.manage']
    } as Api.Role.RoleRecord;

    const wrapper = mountComponent({
      operateType: 'edit',
      rowData,
      actorRoleLevel: 999
    });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    expect((inputs[0].element as HTMLInputElement).readOnly).toBe(true);
    expect((inputs[0].element as HTMLInputElement).value).toBe('R_ADMIN');

    await inputs[1].setValue(' Tenant Admin Updated ');
    await inputs[2].setValue('450');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchUpdateRole).toHaveBeenCalledWith(
      9,
      {
        roleCode: 'R_ADMIN',
        roleName: 'Tenant Admin Updated',
        level: 450,
        description: 'old desc',
        status: '2',
        permissionCodes: ['user.manage']
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
              roleCode: ['The role code has already been taken.']
            }
          }
        }
      }
    };

    fetchCreateRole.mockResolvedValueOnce({ error: backendError });

    const wrapper = mountComponent({ operateType: 'add', actorRoleLevel: 900 });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    await inputs[0].setValue('R_ADMIN');
    await inputs[1].setValue('Admin');
    await inputs[2].setValue('500');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateRole).toHaveBeenCalledTimes(1);
    expect(applyServerValidation).toHaveBeenCalledWith(backendError);
    expect(success).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
