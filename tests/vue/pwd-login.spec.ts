import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const login = vi.fn();
const toggleLoginModule = vi.fn();
const validate = vi.fn();
const applyServerValidation = vi.fn();
const bindModelValidation = vi.fn();

vi.mock('@/store/modules/auth', () => ({
  useAuthStore: () => ({
    login,
    loginLoading: false
  })
}));

vi.mock('@/hooks/common/form', () => ({
  useFormRules: () => ({
    createRequiredRule: () => ({
      required: true
    })
  }),
  useNaiveForm: () => ({
    applyServerValidation,
    bindModelValidation,
    clearServerValidationErrors: vi.fn(),
    formRef: ref(null),
    restoreValidation: vi.fn(),
    serverValidationErrors: ref({}),
    validate,
    withServerValidationRules: vi.fn(() => computed(() => ({})))
  })
}));

vi.mock('@/hooks/common/router', () => ({
  useRouterPush: () => ({
    toggleLoginModule
  })
}));

vi.mock('@/locales', () => ({
  $t: (key: string) => key
}));

const PwdLogin = (await import('@/views/_builtin/login/modules/pwd-login.vue')).default;

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

const CheckboxStub = defineComponent({
  name: 'NCheckbox',
  setup(_, { slots }) {
    return () => h('label', slots.default?.());
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
    return () =>
      h(
        'div',
        {
          ...attrs,
          'data-path': props.path
        },
        slots.default?.()
      );
  }
});

const InputStub = defineComponent({
  name: 'NInput',
  props: {
    autofocus: Boolean,
    placeholder: {
      type: String,
      default: ''
    },
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
        autofocus: props.autofocus,
        placeholder: props.placeholder,
        type: props.type,
        value: props.value,
        onInput: (event: Event) => emit('update:value', (event.target as HTMLInputElement).value)
      });
  }
});

const SpaceStub = defineComponent({
  name: 'NSpace',
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.());
  }
});

const DividerStub = defineComponent({
  name: 'NDivider',
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.());
  }
});

const AlertStub = defineComponent({
  name: 'NAlert',
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.());
  }
});

function mountComponent() {
  return mount(PwdLogin, {
    global: {
      stubs: {
        NAlert: AlertStub as Component,
        NButton: ButtonStub as Component,
        NCheckbox: CheckboxStub as Component,
        NDivider: DividerStub as Component,
        NForm: FormStub as Component,
        NFormItem: FormItemStub as Component,
        NInput: InputStub as Component,
        NSpace: SpaceStub as Component
      }
    }
  });
}

async function flushUi() {
  await Promise.resolve();
  await nextTick();
}

describe('PwdLogin', () => {
  beforeEach(() => {
    login.mockReset();
    toggleLoginModule.mockReset();
    validate.mockReset();
    applyServerValidation.mockReset();
    bindModelValidation.mockReset();

    validate.mockResolvedValue(undefined);
    login.mockResolvedValue({ status: 'success' });
  });

  it('switches to OTP mode when a quick account login requires 2FA', async () => {
    login.mockResolvedValueOnce({ status: '2fa_required' });

    const wrapper = mountComponent();
    const accountButton = wrapper
      .findAll('button')
      .find(button => button.text() === 'page.login.pwdLogin.superNoTenant');

    expect(accountButton).toBeDefined();

    await accountButton!.trigger('click');
    await flushUi();

    expect(login).toHaveBeenCalledWith('Super', '123456', {
      redirect: true,
      rememberMe: true
    });
    expect(wrapper.emitted('update:title')).toEqual([['page.login.pwdLogin.twoFactorOtpPlaceholder']]);
    expect(wrapper.find('input[placeholder="page.login.pwdLogin.twoFactorOtpPlaceholder"]').exists()).toBe(true);

    const backButton = wrapper.findAll('button').find(button => button.text() === 'page.login.common.back');

    expect(backButton).toBeDefined();

    await backButton!.trigger('click');
    await flushUi();

    expect(wrapper.emitted('update:title')?.[1]).toEqual([undefined]);
    expect(wrapper.find('input[placeholder="page.login.pwdLogin.twoFactorOtpPlaceholder"]').exists()).toBe(false);
  });

  it('navigates to reset password when the link button is clicked', async () => {
    const wrapper = mountComponent();
    const resetButton = wrapper
      .findAll('button')
      .find(button => button.text() === 'page.login.pwdLogin.forgetPassword');

    expect(resetButton).toBeDefined();

    await resetButton!.trigger('click');

    expect(toggleLoginModule).toHaveBeenCalledWith('reset-pwd');
  });
});
