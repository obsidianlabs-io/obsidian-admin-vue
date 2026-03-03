import assert from 'node:assert/strict';
import test from 'node:test';
import { createGeneratedCaller } from '../src/service/api/generated-caller';

test('generated caller retries once when token is expired', async () => {
  let callCount = 0;
  let refreshCount = 0;
  const errors: string[] = [];

  const callGenerated = createGeneratedCaller({
    successCode: '0000',
    modalLogoutCodes: [],
    expiredTokenCodes: ['4010'],
    handleExpiredRequest: async () => {
      refreshCount += 1;
      return true;
    },
    showErrorMsg: message => {
      errors.push(message);
    }
  });

  const result = await callGenerated<{ id: number }>(async () => {
    callCount += 1;

    if (callCount === 1) {
      return {
        error: { message: 'expired' },
        response: {
          data: {
            code: '4010',
            msg: 'Token expired'
          }
        }
      };
    }

    return {
      data: {
        code: '0000',
        msg: 'ok',
        data: { id: 1 }
      }
    };
  });

  assert.equal(callCount, 2);
  assert.equal(refreshCount, 1);
  assert.deepEqual(result.data, { id: 1 });
  assert.equal(result.error, null);
  assert.deepEqual(errors, []);
});

test('generated caller respects silent codes', async () => {
  const errors: string[] = [];

  const callGenerated = createGeneratedCaller({
    successCode: '0000',
    modalLogoutCodes: [],
    expiredTokenCodes: [],
    handleExpiredRequest: async () => false,
    showErrorMsg: message => {
      errors.push(message);
    }
  });

  const result = await callGenerated<{ id: number }>(
    async () => {
      return {
        error: { message: 'conflict' },
        response: {
          data: {
            code: '4090',
            msg: 'Conflict'
          }
        }
      };
    },
    {
      silentCodes: ['4090']
    }
  );

  assert.equal(result.data, null);
  assert.ok(result.error);
  assert.equal(errors.length, 0);
});

test('generated caller surfaces backend payload failures', async () => {
  const errors: string[] = [];

  const callGenerated = createGeneratedCaller({
    successCode: '0000',
    modalLogoutCodes: [],
    expiredTokenCodes: [],
    handleExpiredRequest: async () => false,
    showErrorMsg: message => {
      errors.push(message);
    }
  });

  const result = await callGenerated<{ id: number }>(async () => {
    return {
      data: {
        code: '5001',
        msg: 'Server failed',
        data: null
      }
    };
  });

  assert.equal(result.data, null);
  assert.equal(result.error.code, '5001');
  assert.deepEqual(errors, ['Server failed']);
});
