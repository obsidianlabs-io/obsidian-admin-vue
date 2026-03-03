import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

interface OperateModalTitles {
  add: string;
  edit: string;
  view: string;
}

interface UseOperateModalOptions {
  operateType: MaybeRefOrGetter<NaiveUI.TableOperateType>;
  readOnly: MaybeRefOrGetter<boolean | undefined>;
  titles: OperateModalTitles;
}

export function useOperateModal(options: UseOperateModalOptions) {
  const isViewMode = computed(() => Boolean(toValue(options.readOnly)));

  const title = computed(() => {
    if (isViewMode.value) {
      return options.titles.view;
    }

    const operateType = toValue(options.operateType);
    return options.titles[operateType];
  });

  return {
    isViewMode,
    title
  };
}
