<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateRole, fetchGetRoleAssignablePermissions, fetchUpdateRole } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

defineOptions({
  name: 'RoleOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Role.RoleRecord | null;
  /** current actor role level (for UI constraints) */
  actorRoleLevel?: number | null;
  /** whether in view mode */
  readOnly?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const isViewMode = computed(() => Boolean(props.readOnly));
const enableStatusOptions = computed(() => getEnableStatusOptions());
const resolvedActorRoleLevel = computed(() => {
  const level = Number(props.actorRoleLevel ?? 0);

  return Number.isInteger(level) && level > 0 ? level : 0;
});
const maxAssignableRoleLevel = computed(() => resolvedActorRoleLevel.value - 1);
const hasAssignableRoleLevel = computed(() => maxAssignableRoleLevel.value >= 1);
const inputMaxAssignableRoleLevel = computed(() => Math.max(1, maxAssignableRoleLevel.value));
const levelQuickOptions = computed(() => [
  { label: $t('page.role.levelPresetUser'), value: 100 },
  { label: $t('page.role.levelPresetManager'), value: 300 },
  { label: $t('page.role.levelPresetAdmin'), value: 500 }
]);
const levelAllowedRangeHint = computed(() =>
  hasAssignableRoleLevel.value
    ? $t('page.role.levelAllowedRangeHint', {
        current: String(resolvedActorRoleLevel.value),
        min: '1',
        max: String(maxAssignableRoleLevel.value)
      })
    : $t('page.role.levelNoAssignableHint', {
        current: String(resolvedActorRoleLevel.value)
      })
);

const title = computed(() => {
  if (isViewMode.value) {
    return $t('page.role.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.role.addTitle'),
    edit: $t('page.role.editTitle')
  };
  return titles[props.operateType];
});

interface Model {
  roleCode: string;
  roleName: string;
  level: number | null;
  description: string;
  status: Api.Common.EnableStatus;
  permissionCodes: string[];
}

const model = ref<Model>(createDefaultModel());

function createDefaultModel(): Model {
  const defaultLevel = Math.min(100, inputMaxAssignableRoleLevel.value);

  return {
    roleCode: '',
    roleName: '',
    level: defaultLevel,
    description: '',
    status: '1',
    permissionCodes: []
  };
}

interface GroupedPermissionItem {
  group: string;
  permissionCode: string;
  permissionName: string;
}

const permissions = ref<GroupedPermissionItem[]>([]);

const permissionGroups = computed(() => {
  const groupMap = new Map<string, GroupedPermissionItem[]>();

  permissions.value.forEach(item => {
    const group = item.group || 'other';
    const groupItems = groupMap.get(group) || [];
    groupItems.push(item);
    groupMap.set(group, groupItems);
  });

  return Array.from(groupMap.entries())
    .map(([group, items]) => ({
      group,
      items: [...items].sort((a, b) => a.permissionName.localeCompare(b.permissionName)),
      codes: items.map(item => item.permissionCode)
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
});

const selectedPermissionGroups = computed(() => {
  return permissionGroups.value
    .map(group => ({
      group: group.group,
      items: group.items.filter(item => model.value.permissionCodes.includes(item.permissionCode))
    }))
    .filter(group => group.items.length > 0);
});

function roleLevelRule(): App.Global.FormRule {
  return {
    required: true,
    trigger: ['change', 'blur'],
    validator: (_, value) => {
      const level = Number(value);
      if (!Number.isInteger(level) || level < 1 || level > 999) {
        return new Error($t('page.role.levelRangeError'));
      }

      if (!hasAssignableRoleLevel.value) {
        return new Error(levelAllowedRangeHint.value);
      }

      if (level > maxAssignableRoleLevel.value) {
        return new Error(levelAllowedRangeHint.value);
      }

      return true;
    }
  };
}

function applyLevelPreset(level: number) {
  if (isViewMode.value) {
    return;
  }

  if (level > maxAssignableRoleLevel.value) {
    model.value.level = inputMaxAssignableRoleLevel.value;

    return;
  }

  model.value.level = level;
}

function isLevelPresetActive(level: number) {
  return Number(model.value.level ?? 0) === level;
}

function isLevelPresetDisabled(level: number) {
  return level > maxAssignableRoleLevel.value;
}

const rules: Record<'roleCode' | 'roleName' | 'level' | 'status', App.Global.FormRule> = {
  roleCode: defaultRequiredRule,
  roleName: defaultRequiredRule,
  level: roleLevelRule(),
  status: defaultRequiredRule
};

async function getPermissionOptions() {
  permissions.value = [];

  try {
    const { data, error } = await fetchGetRoleAssignablePermissions();

    if (error || !data) {
      permissions.value = [];
      return;
    }

    permissions.value = data.records.map(item => ({
      group: item.group || 'other',
      permissionCode: item.permissionCode,
      permissionName: item.permissionName
    }));
  } catch {
    permissions.value = [];
  }
}

function isGroupChecked(codes: string[]) {
  return codes.every(code => model.value.permissionCodes.includes(code));
}

function isGroupIndeterminate(codes: string[]) {
  const selectedCount = codes.filter(code => model.value.permissionCodes.includes(code)).length;

  return selectedCount > 0 && selectedCount < codes.length;
}

function toggleGroupPermissions(codes: string[], checked: boolean) {
  if (isViewMode.value) {
    return;
  }

  const codeSet = new Set(model.value.permissionCodes);

  if (checked) {
    codes.forEach(code => codeSet.add(code));
  } else {
    codes.forEach(code => codeSet.delete(code));
  }

  model.value.permissionCodes = Array.from(codeSet);
}

function togglePermission(permissionCode: string, checked: boolean) {
  if (isViewMode.value) {
    return;
  }

  const codeSet = new Set(model.value.permissionCodes);

  if (checked) {
    codeSet.add(permissionCode);
  } else {
    codeSet.delete(permissionCode);
  }

  model.value.permissionCodes = Array.from(codeSet);
}

function getGroupTitle(group: string) {
  if (group === 'other') {
    return $t('page.role.otherGroup');
  }

  return group
    .split(/[_\-.]/g)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      roleCode: props.rowData.roleCode,
      roleName: props.rowData.roleName,
      level: props.rowData.level ?? 100,
      description: props.rowData.description,
      status: props.rowData.status,
      permissionCodes: jsonClone(props.rowData.permissionCodes)
    };
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (isViewMode.value) {
    return;
  }

  await validate();

  const payload: Api.Role.RolePayload = {
    roleCode: model.value.roleCode.trim(),
    roleName: model.value.roleName.trim(),
    level: Number(model.value.level ?? 100),
    description: model.value.description.trim(),
    status: model.value.status,
    permissionCodes: model.value.permissionCodes
  };

  const { error } =
    props.operateType === 'add'
      ? await fetchCreateRole(payload)
      : await fetchUpdateRole(props.rowData?.id || 0, payload);

  if (!error) {
    window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
    getPermissionOptions();
  }
});
</script>

<template>
  <FormModalWrapper
    v-model:visible="visible"
    :title="title"
    :read-only="isViewMode"
    wrapper-class="role-operate-modal"
    @submit="handleSubmit"
    @close="closeDrawer"
  >
    <NForm ref="formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.role.roleCode')" path="roleCode">
          <NInput
            v-model:value="model.roleCode"
            :readonly="operateType === 'edit' || isViewMode"
            :placeholder="isViewMode ? '' : $t('page.role.roleCodePlaceholder')"
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('page.role.roleName')" path="roleName">
          <NInput
            v-model:value="model.roleName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.role.roleNamePlaceholder')"
          />
        </NFormItemGi>
      </NGrid>
      <NGrid responsive="screen" item-responsive :x-gap="12">
        <NFormItemGi span="24 s:12" :label="$t('page.role.level')" path="level">
          <template v-if="isViewMode">
            <NTag type="info" :bordered="false">{{ model.level ?? '-' }}</NTag>
          </template>
          <template v-else>
            <div class="w-full">
              <NInputNumber
                v-model:value="model.level"
                class="w-full"
                :min="1"
                :max="inputMaxAssignableRoleLevel"
                :disabled="!hasAssignableRoleLevel"
                :precision="0"
                :step="1"
                :placeholder="$t('page.role.levelPlaceholder')"
              />
              <div class="mt-8px flex flex-wrap gap-8px">
                <NButton
                  v-for="preset in levelQuickOptions"
                  :key="preset.value"
                  size="tiny"
                  :type="isLevelPresetActive(preset.value) ? 'primary' : 'default'"
                  :disabled="isLevelPresetDisabled(preset.value)"
                  ghost
                  @click="applyLevelPreset(preset.value)"
                >
                  {{ preset.label }}
                </NButton>
              </div>
              <p class="mt-6px text-12px text-[#6b7280]">
                {{ $t('page.role.levelHint') }}
              </p>
              <p class="mt-4px text-12px text-[#6b7280]">
                {{ levelAllowedRangeHint }}
              </p>
            </div>
          </template>
        </NFormItemGi>
        <NFormItemGi span="24 s:12" :label="$t('common.status')" path="status">
          <NTag v-if="isViewMode" :type="getEnableStatusTagType(model.status)">
            {{ getEnableStatusLabel(model.status) }}
          </NTag>
          <NRadioGroup v-else v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </NRadioGroup>
        </NFormItemGi>
      </NGrid>
      <NFormItem :label="$t('page.role.permissions')" path="permissionCodes">
        <div class="permission-selector" :class="{ 'view-mode': isViewMode }">
          <template v-if="isViewMode">
            <div v-if="selectedPermissionGroups.length">
              <div v-for="group in selectedPermissionGroups" :key="group.group" class="view-permission-group">
                <p class="view-permission-title">{{ getGroupTitle(group.group) }}</p>
                <div class="view-permission-tags">
                  <NTag
                    v-for="item in group.items"
                    :key="item.permissionCode"
                    size="small"
                    type="info"
                    :bordered="false"
                  >
                    {{ item.permissionName }}
                  </NTag>
                </div>
              </div>
            </div>
            <p v-else class="view-empty">{{ $t('page.role.noPermissionsAssigned') }}</p>
          </template>
          <template v-else>
            <div v-for="group in permissionGroups" :key="group.group" class="permission-group">
              <div class="permission-group-header">
                <span class="permission-group-title">
                  {{ $t('page.role.groupPermissions', { group: getGroupTitle(group.group) }) }}
                </span>
                <NCheckbox
                  :checked="isGroupChecked(group.codes)"
                  :indeterminate="isGroupIndeterminate(group.codes)"
                  @update:checked="checked => toggleGroupPermissions(group.codes, checked)"
                >
                  {{ $t('common.selectAll') }}
                </NCheckbox>
              </div>
              <div class="permission-items">
                <NCheckbox
                  v-for="item in group.items"
                  :key="item.permissionCode"
                  :checked="model.permissionCodes.includes(item.permissionCode)"
                  @update:checked="checked => togglePermission(item.permissionCode, checked)"
                >
                  {{ item.permissionName }}
                </NCheckbox>
              </div>
            </div>
          </template>
        </div>
      </NFormItem>
      <NFormItem :label="$t('common.description')" :show-require-mark="false">
        <NInput
          v-model:value="model.description"
          :readonly="isViewMode"
          type="textarea"
          :placeholder="isViewMode ? '' : $t('page.role.descriptionPlaceholder')"
        />
      </NFormItem>
    </NForm>
  </FormModalWrapper>
</template>

<style scoped>
.view-permission-group + .view-permission-group {
  margin-top: 12px;
}

.view-permission-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.view-permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.view-empty {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.permission-selector {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.permission-selector.view-mode {
  background-color: #fafafa;
}

.permission-group {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.permission-group:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: 0;
}

.permission-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.permission-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.permission-items {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px 12px;
}

@media (min-width: 768px) {
  .permission-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .permission-items {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
