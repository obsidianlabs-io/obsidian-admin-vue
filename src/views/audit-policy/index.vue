<script setup lang="ts">
import { $t } from '@/locales';
import TableWrapper from '@/components/advanced/table-wrapper.vue';
import AuditPolicySearch from './modules/audit-policy-search.vue';
import { useAuditPolicy } from './composables/use-audit-policy';

defineOptions({
  name: 'AuditPolicyPage'
});

const {
  loading,
  saving,
  columns,
  columnChecks,
  searchParams,
  policyCurrent,
  policySize,
  filteredRecords,
  pagedPolicyRecords,
  tableScrollX,
  hasChanges,
  canOpenSaveDialog,
  reasonModalVisible,
  reasonDraft,
  minReasonLength,
  changedActionSet,
  policyRowClassName,
  handleSearch,
  handleRefresh,
  handleResetPolicy,
  openReasonModal,
  confirmSave,
  handlePolicyPageChange,
  handlePolicyPageSizeChange
} = useAuditPolicy();
</script>

<template>
  <TableWrapper :title="$t('route.audit-policy')">
    <template #search>
      <AuditPolicySearch v-model:model="searchParams" @search="handleSearch" />
    </template>

    <template #header-extra>
      <TableHeaderOperation
        v-model:columns="columnChecks"
        :show-add="false"
        :show-delete="false"
        :loading="loading"
        @refresh="handleRefresh"
      >
        <template #default>
          <NButton size="small" :disabled="!hasChanges" @click="handleResetPolicy">
            <template #icon>
              <icon-mdi-restore class="text-icon" />
            </template>
            {{ $t('common.reset') }}
          </NButton>
          <NButton size="small" type="primary" :disabled="!canOpenSaveDialog" @click="openReasonModal">
            <template #icon>
              <icon-mdi-content-save-edit-outline class="text-icon" />
            </template>
            {{ $t('common.update') }}
          </NButton>
        </template>
      </TableHeaderOperation>
    </template>

    <NDataTable
      size="small"
      class="audit-policy-table"
      :columns="columns"
      :data="pagedPolicyRecords"
      :loading="loading"
      :max-height="420"
      :scroll-x="tableScrollX"
      :row-key="row => row.action"
      :pagination="false"
      :row-class-name="policyRowClassName"
    />

    <div class="mt-12px flex justify-end">
      <NPagination
        :page="policyCurrent"
        :page-size="policySize"
        :item-count="filteredRecords.length"
        :page-sizes="[10, 20, 50]"
        show-size-picker
        :prefix="info => $t('datatable.itemCount', { total: info.itemCount })"
        @update:page="handlePolicyPageChange"
        @update:page-size="handlePolicyPageSizeChange"
      />
    </div>

    <NModal
      v-model:show="reasonModalVisible"
      preset="card"
      :title="$t('page.auditPolicy.updateDialogTitle')"
      class="w-640px lt-sm:w-[calc(100%-24px)]"
      :mask-closable="false"
    >
      <div class="mb-8px text-13px text-#6b7280">
        {{ $t('page.auditPolicy.updateDialogHint') }}
      </div>
      <div class="mb-8px flex items-center justify-between">
        <span class="text-13px font-medium">{{ $t('page.auditPolicy.changeReason') }}</span>
        <span class="text-12px text-#6b7280">
          {{ $t('page.auditPolicy.changedEvents') }}: {{ changedActionSet.size }}
        </span>
      </div>
      <NInput
        v-model:value="reasonDraft"
        type="textarea"
        :rows="4"
        :maxlength="500"
        :placeholder="$t('page.auditPolicy.changeReasonPlaceholder')"
        show-count
      />
      <div
        v-if="reasonDraft.trim().length > 0 && reasonDraft.trim().length < minReasonLength"
        class="mt-6px text-12px text-#d03050"
      >
        {{ $t('page.auditPolicy.changeReasonMin') }}
      </div>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <NButton @click="reasonModalVisible = false">
            {{ $t('common.cancel') }}
          </NButton>
          <NButton type="primary" :loading="saving" @click="confirmSave">
            {{ $t('common.update') }}
          </NButton>
        </div>
      </template>
    </NModal>
  </TableWrapper>
</template>

<style scoped>
:deep(.audit-policy-row-changed td) {
  background-color: rgba(24, 160, 88, 0.06);
}

:deep(.audit-policy-table .n-data-table-th--fixed-right),
:deep(.audit-policy-table .n-data-table-td--fixed-right) {
  background-color: var(--n-td-color);
}

:deep(.audit-policy-table .n-data-table-th--first-fixed-right),
:deep(.audit-policy-table .n-data-table-td--first-fixed-right) {
  box-shadow: -6px 0 10px -10px rgba(15, 23, 42, 0.4);
}
</style>
