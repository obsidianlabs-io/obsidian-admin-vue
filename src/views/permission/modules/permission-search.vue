<script setup lang="ts">
import { computed } from 'vue';
import { getEnableStatusOptions } from '@/constants/common';
import { useSearchFormActions } from '@/hooks/business/search-form';
import { $t } from '@/locales';

defineOptions({
  name: 'PermissionSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

interface PermissionSearchModel {
  keyword: string | null;
  group: string | null;
  status: Api.Common.EnableStatus | null;
}

const model = defineModel<PermissionSearchModel>('model', { required: true });

const enableStatusOptions = computed(() => getEnableStatusOptions());
const { reset, search } = useSearchFormActions(model, () => emit('search'));
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="permission-search">
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
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.permission.group')" class="pr-24px">
              <NInput
                v-model:value="model.group"
                clearable
                :placeholder="$t('page.permission.groupPlaceholder')"
                @keyup.enter="search"
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('common.status')" class="pr-24px">
              <NSelect
                v-model:value="model.status"
                clearable
                :options="enableStatusOptions"
                :placeholder="$t('common.selectStatus')"
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
