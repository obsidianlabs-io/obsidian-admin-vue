<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getEnableStatusOptions } from '@/constants/common';
import { fetchGetAllRoles } from '@/service/api';
import { useSearchFormActions } from '@/hooks/business/search-form';
import { $t } from '@/locales';

defineOptions({
  name: 'UserSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

interface UserSearchModel {
  userName: string | null;
  userEmail: string | null;
  roleCode: string | null;
  status: Api.Common.EnableStatus | null;
}

const model = defineModel<UserSearchModel>('model', { required: true });

const roleOptions = ref<CommonType.Option<string>[]>([]);

const enableStatusOptions = computed(() => getEnableStatusOptions());
const { reset, search } = useSearchFormActions(model, () => emit('search'));

async function getRoleOptions() {
  const { data, error } = await fetchGetAllRoles();

  if (!error) {
    roleOptions.value = data.records.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));
  }
}

onMounted(() => {
  getRoleOptions();
});
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="user-search">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:6" :label="$t('page.user.userName')" class="pr-24px">
            <NInput
              v-model:value="model.userName"
              clearable
              :placeholder="$t('page.user.userNamePlaceholder')"
              @keyup.enter="search"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('common.email')" class="pr-24px">
            <NInput
              v-model:value="model.userEmail"
              clearable
              :placeholder="$t('page.user.emailPlaceholder')"
              @keyup.enter="search"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:6" :label="$t('common.role')" class="pr-24px">
            <NSelect
              v-model:value="model.roleCode"
              clearable
              filterable
              :options="roleOptions"
              :placeholder="$t('common.selectRole')"
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
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
