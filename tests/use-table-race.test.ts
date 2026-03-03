import assert from 'node:assert/strict';
import test from 'node:test';
import useTableModule from '../packages/hooks/src/use-table';

const useTable = (useTableModule as unknown as { default?: typeof useTableModule }).default ?? useTableModule;

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve: Deferred<T>['resolve'] = () => undefined;

  const promise = new Promise<T>(r => {
    resolve = r;
  });

  return { promise, resolve };
}

test('useTable ignores stale responses from older in-flight requests', async () => {
  const first = createDeferred<{ id: string }[]>();
  const second = createDeferred<{ id: string }[]>();
  let callCount = 0;

  const table = useTable<{ id: string }[], { id: string }, any, false>({
    api: async () => {
      callCount += 1;
      return callCount === 1 ? first.promise : second.promise;
    },
    pagination: false,
    transform: response => response,
    columns: () => [],
    getColumnChecks: () => [],
    getColumns: columns => columns,
    immediate: false
  });

  const olderRequest = table.getData();
  const latestRequest = table.getData();

  second.resolve([{ id: 'latest' }]);
  await latestRequest;

  assert.deepEqual(table.data.value, [{ id: 'latest' }]);

  first.resolve([{ id: 'stale' }]);
  await olderRequest;

  assert.deepEqual(table.data.value, [{ id: 'latest' }]);
});
