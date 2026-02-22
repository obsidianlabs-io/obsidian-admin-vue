<script setup lang="ts">
import { computed } from 'vue';
import { useSearchFormActions } from '@/hooks/business/search-form';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

interface AuditSearchModel {
  keyword: string | null;
  action: string | null;
  userName: string | null;
  dateRange: [number, number] | null;
}

const model = defineModel<AuditSearchModel>('model', { required: true });

const { reset, search } = useSearchFormActions(model, () => emit('search'));

const dateShortcuts = computed(() => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return {
    [$t('page.audit.last24Hours')]: () => [now - ONE_DAY, now] as [number, number],
    [$t('page.audit.last7Days')]: () => [now - 7 * ONE_DAY, now] as [number, number]
  };
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="audit-search">
        <NForm label-placement="top" :show-feedback="false">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('common.keyword')" class="pr-24px">
              <NInput
                v-model:value="model.keyword"
                clearable
                :placeholder="$t('common.keywordSearch')"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.audit.action')" class="pr-24px">
              <NInput
                v-model:value="model.action"
                clearable
                :placeholder="$t('page.audit.actionPlaceholder')"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.audit.operator')" class="pr-24px">
              <NInput
                v-model:value="model.userName"
                clearable
                :placeholder="$t('page.audit.operatorPlaceholder')"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.audit.timeRange')" class="pr-24px">
              <NDatePicker
                v-model:value="model.dateRange"
                type="datetimerange"
                clearable
                :shortcuts="dateShortcuts"
                class="w-full"
              />
            </NFormItemGi>
            <NFormItemGi span="24 m:24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-mdi-restore class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
