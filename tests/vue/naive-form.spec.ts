import { computed, defineComponent, h, nextTick, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { useNaiveForm } from '@/hooks/common/naive-form';

describe('useNaiveForm', () => {
  it('applies server validation, remaps aliases, and clears field errors on model change', async () => {
    const TestComponent = defineComponent({
      name: 'NaiveFormHarness',
      setup(_, { expose }) {
        const naiveForm = useNaiveForm();
        const model = ref({
          confirmPassword: '',
          email: ''
        });
        const rules = naiveForm.withServerValidationRules(
          computed(() => ({
            email: [
              {
                message: 'Email is required',
                required: true,
                trigger: ['input', 'blur']
              }
            ]
          })),
          ['email', 'confirmPassword'] as const
        );

        naiveForm.bindModelValidation(model, ['email', 'confirmPassword']);

        expose({
          model,
          naiveForm,
          rules
        });

        return () => h('div');
      }
    });

    const wrapper = mount(TestComponent);
    const exposed = wrapper.vm.$.exposed as {
      model: Ref<{ confirmPassword: string; email: string }>;
      naiveForm: ReturnType<typeof useNaiveForm>;
      rules: ComputedRef<Partial<Record<'email' | 'confirmPassword', App.Global.FormRule[]>>>;
    };

    expect(exposed.rules.value.email).toHaveLength(2);
    expect(exposed.rules.value.confirmPassword).toHaveLength(1);

    const applied = await exposed.naiveForm.applyServerValidation(
      {
        response: {
          data: {
            code: '1002',
            data: {
              errors: {
                email: ['Email has already been taken'],
                password_confirmation: ['Passwords do not match']
              }
            },
            msg: 'Validation failed'
          }
        }
      },
      {
        fieldAliases: {
          password_confirmation: 'confirmPassword'
        }
      }
    );

    expect(applied).toBe(true);
    expect(exposed.naiveForm.serverValidationErrors.value).toEqual({
      confirmPassword: ['Passwords do not match'],
      email: ['Email has already been taken']
    });

    exposed.model.value.confirmPassword = 'next-secret';
    await nextTick();

    expect(exposed.naiveForm.serverValidationErrors.value).toEqual({
      email: ['Email has already been taken']
    });

    wrapper.unmount();
  });
});
