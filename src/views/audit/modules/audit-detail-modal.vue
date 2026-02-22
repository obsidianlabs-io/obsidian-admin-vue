<script setup lang="ts">
import { computed } from 'vue';
import { commonFormModalBodyStyle, commonFormModalStyle } from '@/constants/common';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditDetailModal'
});

interface Props {
  rowData?: Api.Audit.AuditLogRecord | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const rowData = computed(() => props.rowData || null);

const oldValuesText = computed(() => {
  if (!rowData.value) {
    return '';
  }

  const values = rowData.value.oldValues || {};
  return Object.keys(values).length ? JSON.stringify(values, null, 2) : '{}';
});

const newValuesText = computed(() => {
  if (!rowData.value) {
    return '';
  }

  const values = rowData.value.newValues || {};
  return Object.keys(values).length ? JSON.stringify(values, null, 2) : '{}';
});

function closeModal() {
  visible.value = false;
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="$t('page.audit.viewTitle')"
    :style="commonFormModalStyle"
    :bordered="false"
    :mask-closable="false"
    class="w-full"
  >
    <div :style="commonFormModalBodyStyle" class="view-mode-form">
      <NDescriptions :column="2" label-placement="top" bordered>
        <NDescriptionsItem :label="$t('page.audit.action')">{{ rowData?.action || '-' }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.audit.operator')">{{ rowData?.userName || '-' }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('common.tenant')">{{ rowData?.tenantName || '-' }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.audit.target')">{{ rowData?.target || '-' }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.audit.ipAddress')">{{ rowData?.ipAddress || '-' }}</NDescriptionsItem>
        <NDescriptionsItem :label="$t('common.createdAt')">{{ rowData?.createTime || '-' }}</NDescriptionsItem>
      </NDescriptions>

      <NDivider class="my-16px" />

      <NForm label-placement="top" :show-feedback="false">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 m:12" :label="$t('page.audit.oldValues')" class="pr-12px">
            <NInput :value="oldValuesText" type="textarea" readonly :autosize="{ minRows: 8, maxRows: 16 }" />
          </NFormItemGi>
          <NFormItemGi span="24 m:12" :label="$t('page.audit.newValues')" class="pr-12px">
            <NInput :value="newValuesText" type="textarea" readonly :autosize="{ minRows: 8, maxRows: 16 }" />
          </NFormItemGi>
          <NFormItemGi span="24" :label="$t('page.audit.userAgent')" class="pr-12px">
            <NInput
              :value="rowData?.userAgent || '-'"
              type="textarea"
              readonly
              :autosize="{ minRows: 2, maxRows: 6 }"
            />
          </NFormItemGi>
        </NGrid>
      </NForm>
    </div>

    <template #footer>
      <div class="w-full flex justify-end">
        <NButton @click="closeModal">{{ $t('common.close') }}</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
