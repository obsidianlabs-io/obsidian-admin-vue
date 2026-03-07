import { defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createPermissionMock = vi.fn();
const updatePermissionMock = vi.fn();
const messageSuccessMock = vi.fn();
const applyServerValidationMock = vi.fn();
const validateMock = vi.fn();
const restoreValidationMock = vi.fn();
const bindModelValidationMock = vi.fn();
const withServerValidationRulesMock = vi.fn((rules: unknown) => rules);

vi.mock('@/service/api', () => ({
  fetchCreatePermission: createPermissionMock,
  fetchUpdatePermission: updatePermissionMock
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/hooks/common/form', () => ({
  useFormRules: () => ({
    defaultRequiredRule: { required: true, message: 'required' }
  }),
  useNaiveForm: () => ({
    formRef: ref(null),
    validate: validateMock,
    restoreValidation: restoreValidationMock,
    bindModelValidation: bindModelValidationMock,
    withServerValidationRules: withServerValidationRulesMock,
    applyServerValidation: applyServerValidationMock
  })
}));

const FormModalWrapperStub = defineComponent({
  name: 'FormModalWrapperStub',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'submit', 'close'],
  setup(props, { emit, slots }) {
    return () =>
      h('div', { 'data-testid': 'form-modal-wrapper', 'data-title': props.title }, [
        slots.default?.(),
        h('button', { type: 'button', 'data-testid': 'submit', onClick: () => emit('submit') }, 'submit'),
        h('button', { type: 'button', 'data-testid': 'close', onClick: () => emit('close') }, 'close')
      ]);
  }
});

const InputStub = defineComponent({
  name: 'NInput',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value'],
  setup(props, { emit, attrs }) {
    return () =>
      h('input', {
        ...attrs,
        value: props.value as string | number,
        readOnly: props.readonly,
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
  setup(props, { slots }) {
    return () => h('div', { 'data-testid': 'radio-group', 'data-value': props.value }, slots.default?.());
  }
});

const RadioStub = defineComponent({
  name: 'NRadio',
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { 'data-testid': `radio-${props.value}` }, props.label);
  }
});

const TagStub = defineComponent({
  name: 'NTag',
  setup(_, { slots }) {
    return () => h('span', { 'data-testid': 'tag' }, slots.default?.());
  }
});

const GridStub = defineComponent({
  name: 'NGrid',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'grid' }, slots.default?.());
  }
});

const FormStub = defineComponent({
  name: 'NForm',
  setup(_, { slots }) {
    return () => h('form', { 'data-testid': 'form' }, slots.default?.());
  }
});

const FormItemGiStub = defineComponent({
  name: 'NFormItemGi',
  props: {
    label: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    return () => h('label', { 'data-testid': `form-item-${props.path || props.label}` }, slots.default?.());
  }
});

const FormItemStub = defineComponent({
  name: 'NFormItem',
  props: {
    label: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    return () => h('label', { 'data-testid': `form-item-${props.path || props.label}` }, slots.default?.());
  }
});

const { default: PermissionOperateDrawer } = await import('@/views/permission/modules/permission-operate-drawer.vue');

function flushUi() {
  return nextTick();
}

describe('permission-operate-drawer', () => {
  beforeEach(() => {
    createPermissionMock.mockReset();
    updatePermissionMock.mockReset();
    messageSuccessMock.mockReset();
    applyServerValidationMock.mockReset();
    validateMock.mockReset();
    restoreValidationMock.mockReset();
    bindModelValidationMock.mockReset();
    withServerValidationRulesMock.mockClear();
    createPermissionMock.mockResolvedValue({ error: null });
    updatePermissionMock.mockResolvedValue({ error: null });
    validateMock.mockResolvedValue(undefined);
    applyServerValidationMock.mockResolvedValue(undefined);
    Object.assign(window, {
      $message: {
        success: messageSuccessMock
      }
    });
  });

  function mountDrawer(options?: {
    operateType?: 'add' | 'edit';
    readOnly?: boolean;
    rowData?: Api.Permission.PermissionRecord | null;
    visible?: boolean;
  }) {
    return mount(PermissionOperateDrawer, {
      props: {
        visible: options?.visible ?? false,
        operateType: options?.operateType ?? 'add',
        readOnly: options?.readOnly ?? false,
        rowData: options?.rowData ?? null
      },
      global: {
        stubs: {
          FormModalWrapper: FormModalWrapperStub as Component,
          NForm: FormStub as Component,
          NGrid: GridStub as Component,
          NFormItemGi: FormItemGiStub as Component,
          NFormItem: FormItemStub as Component,
          NInput: InputStub as Component,
          NRadioGroup: RadioGroupStub as Component,
          NRadio: RadioStub as Component,
          NTag: TagStub as Component
        }
      }
    });
  }

  let wrapper = mountDrawer();

  it('submits create payload with trimmed values and derived group', async () => {
    wrapper = mountDrawer();
    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue(' user.manage ');
    await inputs[1]?.setValue(' Manage User ');
    await inputs[2]?.setValue('  permission description  ');

    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(validateMock).toHaveBeenCalled();
    expect(createPermissionMock).toHaveBeenCalledWith(
      {
        permissionCode: 'user.manage',
        permissionName: 'Manage User',
        group: 'user',
        description: 'permission description',
        status: '1'
      },
      { handleValidationErrorLocally: true }
    );
    expect(messageSuccessMock).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits edit payload through update api and keeps code readonly', async () => {
    wrapper = mountDrawer({
      operateType: 'edit',
      rowData: {
        id: 9,
        permissionCode: 'role.update',
        permissionName: 'Role Update',
        group: 'role',
        description: 'existing description',
        status: '1',
        roleCount: 0,
        createTime: '2026-03-08 10:00:00',
        updateTime: '2026-03-08 10:00:00'
      }
    });
    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    expect(inputs[0]?.attributes('readonly')).toBeDefined();

    await inputs[1]?.setValue(' Role Update Edited ');
    await inputs[2]?.setValue(' updated description ');
    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(updatePermissionMock).toHaveBeenCalledWith(
      9,
      {
        permissionCode: 'role.update',
        permissionName: 'Role Update Edited',
        group: 'role',
        description: 'updated description',
        status: '1'
      },
      { handleValidationErrorLocally: true }
    );
    expect(messageSuccessMock).toHaveBeenCalledWith('common.updateSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('forwards backend validation errors to applyServerValidation', async () => {
    const error = {
      data: {
        errors: {
          permissionCode: ['The permission code has already been taken.']
        }
      }
    };
    createPermissionMock.mockResolvedValueOnce({ error });

    wrapper = mountDrawer();
    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('permission.duplicate');
    await inputs[1]?.setValue('Duplicate');
    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(applyServerValidationMock).toHaveBeenCalledWith(error);
    expect(messageSuccessMock).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
