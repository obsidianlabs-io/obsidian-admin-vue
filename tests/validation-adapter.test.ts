import assert from 'node:assert/strict';
import test from 'node:test';
import { effectScope, nextTick, ref } from 'vue';
import type { FormInst } from 'naive-ui';
import { useNaiveForm } from '../src/hooks/common/naive-form';
import { resolveValidationErrors } from '../src/service/request/validation';

test('resolveValidationErrors reads nested backend field errors', () => {
  const errorLike = {
    response: {
      data: {
        code: '1002',
        msg: 'Validation failed',
        data: {
          errors: {
            email: ['Email has already been taken'],
            userName: ['The user name field is required.']
          }
        }
      }
    }
  };

  const errors = resolveValidationErrors(errorLike);

  assert.deepEqual(errors, {
    email: ['Email has already been taken'],
    userName: ['The user name field is required.']
  });
});

test('useNaiveForm applies, remaps and clears server validation errors', async () => {
  const scope = effectScope();

  try {
    await scope.run(async () => {
      const naiveForm = useNaiveForm();
      const model = ref({
        confirmPassword: '',
        email: ''
      });
      let validateCalls = 0;

      naiveForm.formRef.value = {
        async validate() {
          validateCalls += 1;
          throw new Error('invalid');
        },
        restoreValidation() {}
      } as FormInst;

      naiveForm.bindModelValidation(model, ['confirmPassword', 'email']);

      const applied = await naiveForm.applyServerValidation(
        {
          response: {
            data: {
              code: '1002',
              msg: 'Validation failed',
              data: {
                errors: {
                  password_confirmation: ['Passwords do not match'],
                  email: ['Email has already been taken']
                }
              }
            }
          }
        },
        {
          fieldAliases: {
            password_confirmation: 'confirmPassword'
          }
        }
      );

      assert.equal(applied, true);
      assert.equal(validateCalls, 1);
      assert.deepEqual(naiveForm.serverValidationErrors.value, {
        confirmPassword: ['Passwords do not match'],
        email: ['Email has already been taken']
      });

      model.value.confirmPassword = 'new-secret';
      await nextTick();

      assert.deepEqual(naiveForm.serverValidationErrors.value, {
        email: ['Email has already been taken']
      });

      naiveForm.restoreValidation();
      assert.deepEqual(naiveForm.serverValidationErrors.value, {});
    });
  } finally {
    scope.stop();
  }
});
