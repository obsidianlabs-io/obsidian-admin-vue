import { defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createLanguageMock = vi.fn();
const updateLanguageMock = vi.fn();
const messageSuccessMock = vi.fn();
const applyServerValidationMock = vi.fn();
const validateMock = vi.fn();
const restoreValidationMock = vi.fn();
const bindModelValidationMock = vi.fn();
const withServerValidationRulesMock = vi.fn((rules: unknown) => rules);

vi.mock('@/service/api', () => ({
  fetchCreateLanguageTranslation: createLanguageMock,
  fetchUpdateLanguageTranslation: updateLanguageMock
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

vi.mock('@/locales/default-locale', () => ({
  getDefaultLocale: () => 'en-US'
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

const SelectStub = defineComponent({
  name: 'NSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    return () =>
      h(
        'select',
        {
          'data-testid': 'locale-select',
          value: props.value,
          onChange: (event: Event) => emit('update:value', (event.target as HTMLSelectElement).value)
        },
        (props.options as Array<{ label: string; value: string }>).map(option =>
          h('option', { key: option.value, value: option.value }, option.label)
        )
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

const { default: LanguageOperateDrawer } = await import('@/views/language/modules/language-operate-drawer.vue');

function flushUi() {
  return nextTick();
}

describe('language-operate-drawer', () => {
  beforeEach(() => {
    createLanguageMock.mockReset();
    updateLanguageMock.mockReset();
    messageSuccessMock.mockReset();
    applyServerValidationMock.mockReset();
    validateMock.mockReset();
    restoreValidationMock.mockReset();
    bindModelValidationMock.mockReset();
    withServerValidationRulesMock.mockClear();
    createLanguageMock.mockResolvedValue({ error: null });
    updateLanguageMock.mockResolvedValue({ error: null });
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
    rowData?: Api.Language.TranslationRecord | null;
    visible?: boolean;
    localeOptions?: CommonType.Option<App.I18n.LangType>[];
  }) {
    return mount(LanguageOperateDrawer, {
      props: {
        visible: options?.visible ?? false,
        operateType: options?.operateType ?? 'add',
        readOnly: options?.readOnly ?? false,
        rowData: options?.rowData ?? null,
        localeOptions: options?.localeOptions ?? [
          { label: 'English', value: 'en-US' },
          { label: '简体中文', value: 'zh-CN' }
        ]
      },
      global: {
        stubs: {
          FormModalWrapper: FormModalWrapperStub as Component,
          NForm: FormStub as Component,
          NGrid: GridStub as Component,
          NFormItemGi: FormItemGiStub as Component,
          NInput: InputStub as Component,
          NSelect: SelectStub as Component,
          NRadioGroup: RadioGroupStub as Component,
          NRadio: RadioStub as Component,
          NTag: TagStub as Component
        }
      }
    });
  }

  let wrapper = mountDrawer();

  it('submits create payload with trimmed key and description', async () => {
    wrapper = mountDrawer();
    await wrapper.setProps({ visible: true });
    await flushUi();

    await wrapper.get('[data-testid="locale-select"]').setValue('zh-CN');
    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue(' auth.login.title ');
    await inputs[1]?.setValue('登录');
    await inputs[2]?.setValue('  login title  ');

    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(createLanguageMock).toHaveBeenCalledWith(
      {
        locale: 'zh-CN',
        translationKey: 'auth.login.title',
        translationValue: '登录',
        description: 'login title',
        status: '1'
      },
      { handleValidationErrorLocally: true }
    );
    expect(messageSuccessMock).toHaveBeenCalledWith('common.addSuccess');
    expect(wrapper.emitted('submitted')).toHaveLength(1);
  });

  it('submits edit payload through update api', async () => {
    wrapper = mountDrawer({
      operateType: 'edit',
      rowData: {
        id: 15,
        locale: 'en-US',
        localeName: 'English',
        translationKey: 'app.title',
        translationValue: 'Obsidian',
        description: 'existing description',
        status: '1',
        createTime: '2026-03-08 10:00:00',
        updateTime: '2026-03-08 10:00:00'
      }
    });
    await wrapper.setProps({ visible: true });
    await flushUi();

    const inputs = wrapper.findAll('input');
    await inputs[1]?.setValue('Obsidian Admin');
    await inputs[2]?.setValue(' updated description ');

    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(updateLanguageMock).toHaveBeenCalledWith(
      15,
      {
        locale: 'en-US',
        translationKey: 'app.title',
        translationValue: 'Obsidian Admin',
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
          translationKey: ['The translation key has already been taken.']
        }
      }
    };
    createLanguageMock.mockResolvedValueOnce({ error });

    wrapper = mountDrawer();
    await flushUi();

    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('app.title');
    await inputs[1]?.setValue('Obsidian');
    await wrapper.get('[data-testid="submit"]').trigger('click');
    await flushUi();

    expect(applyServerValidationMock).toHaveBeenCalledWith(error);
    expect(messageSuccessMock).not.toHaveBeenCalled();
    expect(wrapper.emitted('submitted')).toBeUndefined();
  });
});
