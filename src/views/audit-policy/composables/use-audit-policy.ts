import { computed, h, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref, watch } from 'vue';
import { NInputNumber, NSwitch, NTag } from 'naive-ui';
import { appEvent } from '@/constants/event';
import { fetchGetAuditPolicyList, fetchUpdateAuditPolicy } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { useSchemaTableColumns } from '@/hooks/business/schema-table';
import { $t } from '@/locales';

export type CategoryFilter = 'mandatory' | 'optional';
export type LockedFilter = 'locked' | 'editable';
export type ChangeScope = 'all' | 'changed';

export interface AuditPolicySearchModel {
  keyword: string | null;
  category: CategoryFilter | null;
  locked: LockedFilter | null;
  changeScope: ChangeScope;
}

interface AuditPolicyColumnSchema {
  key: string;
  titleKey: string;
  align: 'left' | 'center' | 'right';
  width: number;
  fixed?: 'right';
  kind: 'index' | 'action' | 'description' | 'category' | 'locked' | 'enabled' | 'samplingRate' | 'retentionDays';
}

const AUDIT_POLICY_COLUMN_SCHEMA: AuditPolicyColumnSchema[] = [
  {
    key: 'index',
    titleKey: 'common.index',
    align: 'center',
    width: 64,
    kind: 'index'
  },
  {
    key: 'action',
    titleKey: 'page.auditPolicy.action',
    align: 'left',
    width: 260,
    kind: 'action'
  },
  {
    key: 'description',
    titleKey: 'common.description',
    align: 'left',
    width: 320,
    kind: 'description'
  },
  {
    key: 'category',
    titleKey: 'page.auditPolicy.category',
    align: 'center',
    width: 120,
    kind: 'category'
  },
  {
    key: 'locked',
    titleKey: 'page.auditPolicy.locked',
    align: 'center',
    width: 120,
    kind: 'locked'
  },
  {
    key: 'enabled',
    titleKey: 'page.auditPolicy.enabled',
    align: 'center',
    width: 140,
    fixed: 'right',
    kind: 'enabled'
  },
  {
    key: 'samplingRate',
    titleKey: 'page.auditPolicy.samplingRate',
    align: 'center',
    width: 190,
    fixed: 'right',
    kind: 'samplingRate'
  },
  {
    key: 'retentionDays',
    titleKey: 'page.auditPolicy.retentionDays',
    align: 'center',
    width: 190,
    fixed: 'right',
    kind: 'retentionDays'
  }
];

export function useAuditPolicy() {
  const { hasAuth } = useAuth();
  const canManageAuditPolicy = computed(() => hasAuth('audit.policy.manage'));

  const loading = ref(false);
  const saving = ref(false);
  const records = ref<Api.AuditPolicy.PolicyRecord[]>([]);
  const baselineRecords = ref<Api.AuditPolicy.PolicyRecord[]>([]);
  const reasonModalVisible = ref(false);
  const reasonDraft = ref('');
  const minReasonLength = 3;
  let realtimeListenerBound = false;

  const policyCurrent = ref(1);
  const policySize = ref(10);

  const searchParams = reactive<AuditPolicySearchModel>({
    keyword: null,
    category: null,
    locked: null,
    changeScope: 'all'
  });

  function normalizeSamplingRate(value: number): number {
    const normalized = Number.isFinite(value) ? value : 0;
    return Number(Math.min(1, Math.max(0, normalized)).toFixed(4));
  }

  function normalizeRetentionDays(value: number): number {
    const normalized = Number.isFinite(value) ? Math.trunc(value) : 1;
    if (normalized < 1) {
      return 1;
    }
    if (normalized > 3650) {
      return 3650;
    }
    return normalized;
  }

  function cloneRecords(source: Api.AuditPolicy.PolicyRecord[]): Api.AuditPolicy.PolicyRecord[] {
    return source.map(item => ({
      ...item,
      samplingRate: normalizeSamplingRate(item.samplingRate),
      retentionDays: normalizeRetentionDays(item.retentionDays)
    }));
  }

  function getCategoryLabel(category: Api.AuditPolicy.PolicyRecord['category']) {
    return category === 'mandatory'
      ? $t('page.auditPolicy.categoryMandatory')
      : $t('page.auditPolicy.categoryOptional');
  }

  function getLockedLabel(locked: boolean) {
    return locked ? $t('page.auditPolicy.lockedYes') : $t('page.auditPolicy.lockedNo');
  }

  const baselineByAction = computed(() => {
    return new Map(
      baselineRecords.value.map(item => [
        item.action,
        {
          enabled: item.enabled,
          samplingRate: normalizeSamplingRate(item.samplingRate),
          retentionDays: normalizeRetentionDays(item.retentionDays)
        }
      ])
    );
  });

  function isPolicyChanged(row: Api.AuditPolicy.PolicyRecord): boolean {
    const baseline = baselineByAction.value.get(row.action);
    if (!baseline) {
      return false;
    }

    return (
      baseline.enabled !== row.enabled ||
      baseline.samplingRate !== normalizeSamplingRate(row.samplingRate) ||
      baseline.retentionDays !== normalizeRetentionDays(row.retentionDays)
    );
  }

  const changedActionSet = computed(() => {
    return new Set(records.value.filter(item => isPolicyChanged(item)).map(item => item.action));
  });

  const hasChanges = computed(() => changedActionSet.value.size > 0);
  const canOpenSaveDialog = computed(() => canManageAuditPolicy.value && hasChanges.value);

  const filteredRecords = computed(() => {
    const keyword = (searchParams.keyword ?? '').trim().toLowerCase();

    return records.value.filter(item => {
      if (keyword) {
        const actionMatched = item.action.toLowerCase().includes(keyword);
        const descriptionMatched = item.description.toLowerCase().includes(keyword);
        if (!actionMatched && !descriptionMatched) {
          return false;
        }
      }

      if (searchParams.category && item.category !== searchParams.category) {
        return false;
      }

      if (searchParams.locked === 'locked' && !item.locked) {
        return false;
      }

      if (searchParams.locked === 'editable' && item.locked) {
        return false;
      }

      if (searchParams.changeScope === 'changed' && !changedActionSet.value.has(item.action)) {
        return false;
      }

      return true;
    });
  });

  const pagedPolicyRecords = computed(() => {
    const start = (policyCurrent.value - 1) * policySize.value;
    const end = start + policySize.value;

    return filteredRecords.value.slice(start, end);
  });

  watch(
    () => [searchParams.keyword, searchParams.category, searchParams.locked, searchParams.changeScope],
    () => {
      policyCurrent.value = 1;
    }
  );

  watch(
    () => [filteredRecords.value.length, policySize.value],
    () => {
      const maxPage = Math.max(1, Math.ceil(filteredRecords.value.length / policySize.value));
      if (policyCurrent.value > maxPage) {
        policyCurrent.value = maxPage;
      }
    },
    { immediate: true }
  );

  function handlePolicyPageChange(page: number) {
    policyCurrent.value = page;
  }

  function handlePolicyPageSizeChange(pageSize: number) {
    policySize.value = pageSize;
    policyCurrent.value = 1;
  }

  const baseColumns = computed<NaiveUI.TableColumn<Api.AuditPolicy.PolicyRecord>[]>(() => {
    return AUDIT_POLICY_COLUMN_SCHEMA.map(schema => {
      if (schema.kind === 'index') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          render: (_row, index) => (policyCurrent.value - 1) * policySize.value + index + 1
        };
      }

      if (schema.kind === 'action') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width
        };
      }

      if (schema.kind === 'description') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          ellipsis: {
            tooltip: true
          },
          render: row => row.description || '-'
        };
      }

      if (schema.kind === 'category') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          render: row =>
            h(
              NTag,
              {
                type: row.category === 'mandatory' ? 'error' : 'info'
              },
              {
                default: () => getCategoryLabel(row.category)
              }
            )
        };
      }

      if (schema.kind === 'locked') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          render: row =>
            h(
              NTag,
              {
                type: row.locked ? 'warning' : 'success'
              },
              {
                default: () => getLockedLabel(row.locked)
              }
            )
        };
      }

      if (schema.kind === 'enabled') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          fixed: schema.fixed,
          render: row =>
            h(
              'div',
              { class: 'flex-center w-full' },
              h(NSwitch, {
                value: row.enabled,
                size: 'small',
                disabled: !canManageAuditPolicy.value || row.locked,
                onUpdateValue: value => {
                  row.enabled = row.locked ? true : value;
                  if (!row.enabled) {
                    row.samplingRate = 0;
                  }
                }
              })
            )
        };
      }

      if (schema.kind === 'samplingRate') {
        return {
          key: schema.key,
          title: $t(schema.titleKey as App.I18n.I18nKey),
          align: schema.align,
          width: schema.width,
          fixed: schema.fixed,
          render: row =>
            h(NInputNumber, {
              value: row.samplingRate,
              min: 0,
              max: 1,
              step: 0.05,
              precision: 2,
              size: 'small',
              style: { width: '150px' },
              disabled: !canManageAuditPolicy.value || row.locked || !row.enabled,
              onUpdateValue: value => {
                if (value === null) return;
                row.samplingRate = normalizeSamplingRate(value);
              }
            })
        };
      }

      return {
        key: schema.key,
        title: $t(schema.titleKey as App.I18n.I18nKey),
        align: schema.align,
        width: schema.width,
        fixed: schema.fixed,
        render: row =>
          h(NInputNumber, {
            value: row.retentionDays,
            min: 1,
            max: 3650,
            step: 1,
            size: 'small',
            style: { width: '150px' },
            disabled: !canManageAuditPolicy.value || row.locked,
            onUpdateValue: value => {
              if (value === null) return;
              row.retentionDays = normalizeRetentionDays(value);
            }
          })
      };
    });
  });

  const { columnChecks, columns, scrollX } = useSchemaTableColumns(baseColumns);

  function policyRowClassName(row: Api.AuditPolicy.PolicyRecord) {
    return changedActionSet.value.has(row.action) ? 'audit-policy-row-changed' : '';
  }

  async function loadData() {
    loading.value = true;
    const { data, error } = await fetchGetAuditPolicyList();

    if (error) {
      loading.value = false;
      return;
    }

    const list = Array.isArray(data.records) ? data.records : [];
    const cloned = cloneRecords(list);
    records.value = cloned;
    baselineRecords.value = cloneRecords(cloned);
    loading.value = false;
  }

  function handleRealtimeUpdate(event: Event) {
    const customEvent = event as CustomEvent<{ topic?: string }>;
    if (customEvent.detail?.topic !== 'audit-policy') {
      return;
    }

    if (hasChanges.value) {
      window.$message?.warning($t('page.auditPolicy.realtimePendingChanges'));
      return;
    }

    loadData().catch(() => {});
    window.$message?.info($t('page.auditPolicy.realtimeRefreshed'));
  }

  function bindRealtimeListener() {
    if (realtimeListenerBound) {
      return;
    }

    window.addEventListener(appEvent.systemRealtimeUpdated, handleRealtimeUpdate as EventListener);
    realtimeListenerBound = true;
  }

  function unbindRealtimeListener() {
    if (!realtimeListenerBound) {
      return;
    }

    window.removeEventListener(appEvent.systemRealtimeUpdated, handleRealtimeUpdate as EventListener);
    realtimeListenerBound = false;
  }

  function handleSearch() {
    policyCurrent.value = 1;
  }

  async function handleRefresh() {
    await loadData();
  }

  function handleResetPolicy() {
    records.value = cloneRecords(baselineRecords.value);
    reasonDraft.value = '';
  }

  function openReasonModal() {
    if (!canOpenSaveDialog.value) {
      return;
    }

    reasonDraft.value = '';
    reasonModalVisible.value = true;
  }

  async function handleSave(reason: string) {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < minReasonLength) {
      window.$message?.warning($t('page.auditPolicy.changeReasonMin'));
      return;
    }

    const changedRecords = records.value.filter(item => changedActionSet.value.has(item.action));
    if (changedRecords.length === 0) {
      return;
    }

    const payload: Api.AuditPolicy.UpdatePayload = {
      records: changedRecords.map(item => ({
        action: item.action,
        enabled: item.enabled,
        samplingRate: normalizeSamplingRate(item.samplingRate),
        retentionDays: normalizeRetentionDays(item.retentionDays)
      })),
      changeReason: trimmedReason
    };

    saving.value = true;
    const { data, error } = await fetchUpdateAuditPolicy(payload);
    saving.value = false;

    if (error) {
      return;
    }

    const cloned = cloneRecords(data.records);
    records.value = cloned;
    baselineRecords.value = cloneRecords(cloned);
    reasonDraft.value = '';
    reasonModalVisible.value = false;
    window.$message?.success($t('common.updateSuccess'));
  }

  async function confirmSave() {
    await handleSave(reasonDraft.value);
  }

  onMounted(async () => {
    bindRealtimeListener();
    await loadData();
  });

  onActivated(async () => {
    bindRealtimeListener();
    if (records.value.length === 0 && !loading.value) {
      await loadData();
    }
  });

  onDeactivated(() => {
    unbindRealtimeListener();
  });

  onBeforeUnmount(() => {
    unbindRealtimeListener();
  });

  return {
    loading,
    saving,
    columns,
    columnChecks,
    searchParams,
    policyCurrent,
    policySize,
    filteredRecords,
    pagedPolicyRecords,
    tableScrollX: scrollX,
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
  };
}
