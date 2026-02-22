import type { Ref } from 'vue';
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';

export function useSearchFormActions<T extends object>(model: Ref<T>, onSearch: () => void) {
  const defaultModel = jsonClone(toRaw(model.value));

  function reset() {
    Object.assign(model.value, jsonClone(defaultModel));
    onSearch();
  }

  function search() {
    onSearch();
  }

  return {
    reset,
    search
  };
}
