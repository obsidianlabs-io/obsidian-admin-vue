import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCreateUser = vi.fn();
const fetchGetAllOrganizations = vi.fn();
const fetchGetAllRoles = vi.fn();
const fetchGetAllTeams = vi.fn();
const fetchUpdateUser = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();
const restoreValidation = vi.fn();
const success = vi.fn();

vi.mock('@/service/api', () => ({
  fetchCreateUser,
  fetchGetAllOrganizations,
  fetchGetAllRoles,
  fetchGetAllTeams,
  fetchUpdateUser
}));

vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({
    userInfo: {
      currentTenantId: 1
    }
  })
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/hooks/common/form', () => ({
  useFormRules: () => ({
    defaultRequiredRule: {
      required: true
    },
    patternRules: {
      email: {
        required: false
      }
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

const UserOperateDrawer = (await import('@/views/user/modules/user-operate-drawer.vue')).default;

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

const SelectStub = defineComponent({
  name: 'NSelect',
  props: {
    value: {
      type: [String, Number, null],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value'],
  setup(props, { attrs, emit }) {
    return () =>
      h(
        'select',
        {
          ...attrs,
          'aria-label': props.placeholder,
          value: props.value === null ? '' : String(props.value),
          onChange: (event: Event) => {
            const rawValue = (event.target as HTMLSelectElement).value;

            if (rawValue === '') {
              emit('update:value', null);
              return;
            }

            const option = (props.options as Array<{ value: string | number }>).find(
              item => String(item.value) === rawValue
            );
            emit('update:value', option ? option.value : rawValue);
          }
        },
        [
          h('option', { value: '' }, ''),
          ...(props.options as Array<{ value: string | number; label: string }>).map(option =>
            h('option', { key: String(option.value), value: String(option.value) }, option.label)
          )
        ]
      );
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

async function flushUi() {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountComponent(options?: {
  operateType?: 'add' | 'edit';
  rowData?: Api.User.UserRecord | null;
  visible?: boolean;
}) {
  return mount(UserOperateDrawer, {
    props: {
      visible: options?.visible ?? false,
      operateType: options?.operateType ?? 'add',
      rowData: options?.rowData ?? null
    },
    global: {
      stubs: {
        FormModalWrapper: FormModalWrapperStub as Component,
        NForm: FormStub as Component,
        NFormItem: FormItemStub as Component,
        NInput: InputStub as Component,
        NSelect: SelectStub as Component,
        NRadioGroup: RadioGroupStub as Component,
        NRadio: RadioStub as Component,
        NTag: TagStub as Component
      }
    }
  });
}

describe('UserOperateDrawer', () => {
  beforeEach(() => {
    fetchCreateUser.mockReset();
    fetchGetAllOrganizations.mockReset();
    fetchGetAllRoles.mockReset();
    fetchGetAllTeams.mockReset();
    fetchUpdateUser.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();
    restoreValidation.mockReset();
    success.mockReset();

    validate.mockResolvedValue(undefined);
    applyServerValidation.mockResolvedValue(true);
    fetchCreateUser.mockResolvedValue({ error: undefined });
    fetchUpdateUser.mockResolvedValue({ error: undefined });
    fetchGetAllRoles.mockResolvedValue({
      data: {
        records: [{ roleName: 'Admin', roleCode: 'R_ADMIN' }]
      },
      error: undefined
    });
    fetchGetAllOrganizations.mockResolvedValue({
      data: {
        records: [{ id: 1, organizationName: 'HQ' }]
      },
      error: undefined
    });
    fetchGetAllTeams.mockResolvedValue({
      data: {
        records: [{ id: 11, teamName: 'Ops', organizationId: 1 }]
      },
      error: undefined
    });

    Object.assign(window, {
      $message: {
        success
      }
    });
  });

  it('submits a trimmed add payload while preserving password bytes', async () => {
    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    const selects = wrapper.findAll('select');

    expect(inputs).toHaveLength(4);
    expect(selects).toHaveLength(3);

    await inputs[0].setValue(' Alice ');
    await inputs[1].setValue(' alice@example.com ');
    await inputs[2].setValue(' Secret 123! ');
    await inputs[3].setValue(' Secret 123! ');
    await selects[0].setValue('R_ADMIN');
    await selects[1].setValue('1');
    await flushUi();
    await selects[2].setValue('11');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchGetAllRoles).toHaveBeenCalledWith({ manageableOnly: true });
    expect(validate).toHaveBeenCalledTimes(1);
    expect(fetchCreateUser).toHaveBeenCalledWith(
      {
        userName: 'Alice',
        email: 'alice@example.com',
        roleCode: 'R_ADMIN',
        organizationId: 1,
        teamId: 11,
        password: ' Secret 123! ',
        status: '1'
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits the edit flow through update api without sending an empty password', async () => {
    const rowData = {
      id: 7,
      userName: 'Bob',
      email: 'bob@example.com',
      roleCode: 'R_ADMIN',
      status: '2',
      organizationId: '1',
      teamId: '11',
      createTime: '2026-03-08 00:00:00',
      updateTime: '2026-03-08 00:00:00'
    } as Api.User.UserRecord;

    const wrapper = mountComponent({
      operateType: 'edit',
      rowData
    });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');

    expect(inputs).toHaveLength(4);
    expect((inputs[0].element as HTMLInputElement).value).toBe('Bob');
    expect((inputs[1].element as HTMLInputElement).value).toBe('bob@example.com');

    await inputs[0].setValue(' Bob Updated ');
    await inputs[1].setValue(' bob.updated@example.com ');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchUpdateUser).toHaveBeenCalledWith(
      7,
      {
        userName: 'Bob Updated',
        email: 'bob.updated@example.com',
        roleCode: 'R_ADMIN',
        organizationId: 1,
        teamId: 11,
        status: '2'
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
              email: ['The email has already been taken.']
            }
          }
        }
      }
    };

    fetchCreateUser.mockResolvedValueOnce({ error: backendError });

    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    const selects = wrapper.findAll('select');

    await inputs[0].setValue('Alice');
    await inputs[1].setValue('alice@example.com');
    await inputs[2].setValue('Secret123!');
    await inputs[3].setValue('Secret123!');
    await selects[0].setValue('R_ADMIN');
    await selects[1].setValue('1');
    await flushUi();
    await selects[2].setValue('11');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateUser).toHaveBeenCalledTimes(1);
    expect(applyServerValidation).toHaveBeenCalledWith(backendError);
    expect(success).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
