import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchCreateTeam = vi.fn();
const fetchUpdateTeam = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();
const restoreValidation = vi.fn();
const success = vi.fn();
const warning = vi.fn();

vi.mock('@/service/api', () => ({
  fetchCreateTeam,
  fetchUpdateTeam
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

const TeamOperateDrawer = (await import('@/views/team/modules/team-operate-drawer.vue')).default;

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

function mountComponent(options?: {
  operateType?: 'add' | 'edit';
  rowData?: Api.Team.TeamRecord | null;
  visible?: boolean;
}) {
  return mount(TeamOperateDrawer, {
    props: {
      visible: options?.visible ?? false,
      operateType: options?.operateType ?? 'add',
      rowData: options?.rowData ?? null,
      organizationOptions: [
        { label: 'HQ', value: 1 },
        { label: 'Branch', value: 2 }
      ]
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
        NSelect: SelectStub as Component,
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

describe('TeamOperateDrawer', () => {
  beforeEach(() => {
    fetchCreateTeam.mockReset();
    fetchUpdateTeam.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();
    restoreValidation.mockReset();
    success.mockReset();
    warning.mockReset();

    validate.mockResolvedValue(undefined);
    applyServerValidation.mockResolvedValue(true);
    fetchCreateTeam.mockResolvedValue({ error: undefined });
    fetchUpdateTeam.mockResolvedValue({ error: undefined });

    Object.assign(window, {
      $message: {
        success,
        warning
      }
    });
  });

  it('submits a trimmed add payload through create team', async () => {
    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    const selects = wrapper.findAll('select');

    await selects[0].setValue('2');
    await inputs[0].setValue(' TEAM-OPS ');
    await inputs[1].setValue(' Operations ');
    await inputs[2].setValue('9');
    await inputs[3].setValue(' Core ops ');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateTeam).toHaveBeenCalledWith(
      {
        organizationId: 2,
        teamCode: 'TEAM-OPS',
        teamName: 'Operations',
        description: 'Core ops',
        status: '1',
        sort: 9
      },
      {
        handleValidationErrorLocally: true
      }
    );
    expect(success).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits the edit flow through update team and keeps team code read-only', async () => {
    const rowData = {
      id: 5,
      organizationId: '1',
      organizationName: 'HQ',
      teamCode: 'TEAM-OPS',
      teamName: 'Operations',
      description: 'Core ops',
      status: '2',
      sort: 4,
      createTime: '2026-03-08 00:00:00',
      updateTime: '2026-03-08 00:00:00'
    } as Api.Team.TeamRecord;

    const wrapper = mountComponent({ operateType: 'edit', rowData });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    const selects = wrapper.findAll('select');

    expect((inputs[0].element as HTMLInputElement).readOnly).toBe(true);
    expect((inputs[0].element as HTMLInputElement).value).toBe('TEAM-OPS');
    expect((selects[0].element as HTMLSelectElement).value).toBe('1');

    await inputs[1].setValue(' Operations Updated ');
    await inputs[2].setValue('6');
    await inputs[3].setValue(' Updated desc ');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchUpdateTeam).toHaveBeenCalledWith(
      5,
      {
        organizationId: 1,
        teamCode: 'TEAM-OPS',
        teamName: 'Operations Updated',
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
              teamCode: ['The team code has already been taken.']
            }
          }
        }
      }
    };

    fetchCreateTeam.mockResolvedValueOnce({ error: backendError });

    const wrapper = mountComponent({ operateType: 'add' });

    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    const selects = wrapper.findAll('select');

    await selects[0].setValue('1');
    await inputs[0].setValue('TEAM-OPS');
    await inputs[1].setValue('Operations');
    await inputs[2].setValue('9');
    await inputs[3].setValue('Core ops');
    await flushUi();

    await wrapper.get('[data-testid="modal-submit"]').trigger('click');
    await flushUi();

    expect(fetchCreateTeam).toHaveBeenCalledTimes(1);
    expect(applyServerValidation).toHaveBeenCalledWith(backendError);
    expect(success).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
