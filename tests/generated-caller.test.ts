import assert from 'node:assert/strict';
import test from 'node:test';
import { createGeneratedCaller } from '../src/service/api/generated-caller';

test('generated caller unwraps wrapper payload success responses', async () => {
  const callGenerated = createGeneratedCaller();

  const result = await callGenerated<{ id: number }>(async () => {
    return {
      data: {
        code: '0000',
        msg: 'ok',
        data: { id: 1 }
      }
    };
  });

  assert.deepEqual(result.data, { id: 1 });
  assert.equal(result.error, null);
});

test('generated caller passes through axios-style errors', async () => {
  const callGenerated = createGeneratedCaller();
  const error = {
    message: 'Request failed',
    error: {
      code: '1002',
      msg: 'Validation failed',
      data: {
        errors: {
          email: ['The email field is required.']
        }
      }
    },
    response: {
      data: {
        code: '1002',
        msg: 'Validation failed',
        data: {
          errors: {
            email: ['The email field is required.']
          }
        }
      }
    }
  };

  const result = await callGenerated<{ id: number }>(async () => {
    return error;
  });

  assert.equal(result.data, null);
  assert.equal(result.error, error);
  assert.deepEqual(result.response, error.response);
});
