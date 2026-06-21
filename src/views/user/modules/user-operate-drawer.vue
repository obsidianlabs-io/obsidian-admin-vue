<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import {
  fetchCreateUser,
  fetchGetAllOrganizations,
  fetchGetAllRoles,
  fetchGetAllTeams,
  fetchUpdateUser
} from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { useOperateForm } from '../../_shared/composables/use-operate-form';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.User.UserRecord | null;
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

const authStore = useAuthStore();
const enableStatusOptions = computed(() => getEnableStatusOptions());
const hasTenantScope = computed(() => Boolean(authStore.userInfo.currentTenantId));

type Model = Pick<Api.User.UserRecord, 'userName' | 'email' | 'status'>;
type UserFormModel = Model & {
  roleCode: string | null;
  organizationId: number | null;
  teamId: number | null;
  password: string;
  confirmPassword: string;
};

interface OrganizationOption {
  label: string;
  value: number;
}

interface TeamOption {
  label: string;
  value: number;
  organizationId: number;
}

const model = ref<UserFormModel>(createDefaultModel());

function createDefaultModel(): UserFormModel {
  return {
    userName: '',
    email: '',
    roleCode: null,
    organizationId: null,
    teamId: null,
    password: '',
    confirmPassword: '',
    status: '1'
  };
}

const { defaultRequiredRule, patternRules, naiveForm, isViewMode, title, closeDrawer, handleSubmit } = useOperateForm({
  visible,
  operateType: () => props.operateType,
  readOnly: () => props.readOnly,
  titles: {
    add: $t('page.user.addTitle'),
    edit: $t('page.user.editTitle'),
    view: $t('page.user.viewTitle')
  },
  model,
  createDefaultModel,
  initModel,
  validationKeys: ['userName', 'email', 'roleCode', 'status', 'password', 'confirmPassword'],
  onOpened: loadOptionsForUserForm,
  submit: submitUser,
  onSubmitted: () => emit('submitted')
});

const roleOptions = ref<CommonType.Option<string>[]>([]);
const organizationOptions = ref<OrganizationOption[]>([]);
const teamOptions = ref<TeamOption[]>([]);

const filteredTeamOptions = computed<CommonType.Option<number>[]>(() => {
  const organizationId = model.value.organizationId;

  return teamOptions.value
    .filter(item => organizationId === null || item.organizationId === organizationId)
    .map(item => ({
      label: item.label,
      value: item.value
    }));
});

const selectedRoleName = computed(() => {
  const roleCode = model.value.roleCode || props.rowData?.roleCode || '';
  const role = roleOptions.value.find(item => item.value === roleCode);

  return role?.label || props.rowData?.roleName || $t('common.noData');
});

const selectedOrganizationName = computed(() => {
  const organizationId = model.value.organizationId;
  const organization = organizationOptions.value.find(item => item.value === organizationId);

  return organization?.label || props.rowData?.organizationName || $t('common.noData');
});

const selectedTeamName = computed(() => {
  const teamId = model.value.teamId;
  const team = teamOptions.value.find(item => item.value === teamId);

  return team?.label || props.rowData?.teamName || $t('common.noData');
});

const baseRules = computed<
  Partial<Record<'userName' | 'email' | 'roleCode' | 'status' | 'password' | 'confirmPassword', App.Global.FormRule[]>>
>(() => {
  const confirmPasswordRule: App.Global.FormRule[] = [
    {
      validator: () => {
        const password = model.value.password;
        const confirmPassword = model.value.confirmPassword;

        if (props.operateType === 'add') {
          if (!password) {
            return new Error($t('page.user.validation.passwordRequired'));
          }
          if (!confirmPassword) {
            return new Error($t('page.user.validation.confirmPasswordRequired'));
          }
          if (password !== confirmPassword) {
            return new Error($t('page.user.validation.confirmPasswordMismatch'));
          }
          return true;
        }

        if (!password && !confirmPassword) {
          return true;
        }

        if (!password) {
          return new Error($t('page.user.validation.newPasswordRequired'));
        }
        if (!confirmPassword) {
          return new Error($t('page.user.validation.confirmNewPasswordRequired'));
        }
        if (password !== confirmPassword) {
          return new Error($t('page.user.validation.confirmPasswordMismatch'));
        }
        return true;
      },
      trigger: ['input', 'blur']
    }
  ];

  const passwordRule: App.Global.FormRule[] = [
    {
      validator: () => {
        if (props.operateType === 'add') {
          return model.value.password !== '' || new Error($t('page.user.validation.passwordRequired'));
        }

        const password = model.value.password;
        const confirmPassword = model.value.confirmPassword;
        if (!password && !confirmPassword) {
          return true;
        }
        if (!password && confirmPassword) {
          return new Error($t('page.user.validation.newPasswordRequired'));
        }
        return true;
      },
      trigger: ['input', 'blur']
    }
  ];

  return {
    userName: [defaultRequiredRule],
    email: [defaultRequiredRule, patternRules.email],
    roleCode: [defaultRequiredRule],
    status: [defaultRequiredRule],
    password: passwordRule,
    confirmPassword: confirmPasswordRule
  };
});
const rules = naiveForm.withServerValidationRules(baseRules, [
  'userName',
  'email',
  'roleCode',
  'status',
  'password',
  'confirmPassword'
] as const);

function initModel(): UserFormModel {
  const nextModel = createDefaultModel();
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(nextModel, jsonClone(props.rowData));
    nextModel.roleCode = props.rowData.roleCode ?? null;
    nextModel.organizationId = toPositiveInt(props.rowData.organizationId);
    nextModel.teamId = toPositiveInt(props.rowData.teamId);
  }

  return nextModel;
}

function toPositiveInt(value: unknown): number | null {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    return null;
  }

  return num;
}

async function getRoleOptions() {
  roleOptions.value = [];

  const { data, error } = await fetchGetAllRoles({ manageableOnly: true });

  if (!error) {
    roleOptions.value = data.records.map(item => ({
      label: item.roleName,
      value: item.roleCode
    }));

    return;
  }

  roleOptions.value = [];
}

async function getOrganizationOptions() {
  organizationOptions.value = [];

  const { data, error } = await fetchGetAllOrganizations();
  if (error) {
    return;
  }

  organizationOptions.value = data.records.map(item => ({
    label: item.organizationName,
    value: item.id
  }));
}

async function getTeamOptions() {
  teamOptions.value = [];

  const { data, error } = await fetchGetAllTeams();
  if (error) {
    return;
  }

  teamOptions.value = data.records
    .map(item => {
      const organizationId = toPositiveInt(item.organizationId);

      if (organizationId === null) {
        return null;
      }

      return {
        label: item.teamName,
        value: item.id,
        organizationId
      } satisfies TeamOption;
    })
    .filter((item): item is TeamOption => item !== null);
}

async function loadOptionsForUserForm() {
  if (isViewMode.value) {
    return;
  }

  if (!hasTenantScope.value) {
    organizationOptions.value = [];
    teamOptions.value = [];
    model.value.organizationId = null;
    model.value.teamId = null;
  }

  await Promise.all([getRoleOptions(), ...(hasTenantScope.value ? [getOrganizationOptions(), getTeamOptions()] : [])]);
}

async function submitUser(currentModel: UserFormModel) {
  const roleCode = currentModel.roleCode || '';
  const payload: Api.User.UserPayload = {
    userName: currentModel.userName.trim(),
    email: currentModel.email.trim(),
    roleCode,
    status: currentModel.status
  };
  const organizationId = toPositiveInt(currentModel.organizationId);
  const teamId = toPositiveInt(currentModel.teamId);

  if (organizationId !== null) {
    payload.organizationId = organizationId;
  }

  if (teamId !== null) {
    payload.teamId = teamId;
  }

  const password = currentModel.password;
  if (props.operateType === 'add') {
    payload.password = password;
  } else if (password !== '') {
    payload.password = password;
  }

  return props.operateType === 'add'
    ? fetchCreateUser(payload, { handleValidationErrorLocally: true })
    : fetchUpdateUser(props.rowData?.id || 0, payload, { handleValidationErrorLocally: true });
}

watch(
  () => model.value.teamId,
  teamId => {
    if (teamId === null) {
      return;
    }

    const selectedTeam = teamOptions.value.find(item => item.value === teamId);
    if (!selectedTeam) {
      return;
    }

    if (model.value.organizationId !== selectedTeam.organizationId) {
      model.value.organizationId = selectedTeam.organizationId;
    }
  }
);

watch(
  () => model.value.organizationId,
  organizationId => {
    const teamId = model.value.teamId;
    if (teamId === null) {
      return;
    }

    if (teamOptions.value.length === 0) {
      return;
    }

    const selectedTeam = teamOptions.value.find(item => item.value === teamId);
    if (!selectedTeam) {
      model.value.teamId = null;
      return;
    }

    if (organizationId !== selectedTeam.organizationId) {
      model.value.teamId = null;
    }
  }
);

watch(
  teamOptions,
  options => {
    const teamId = model.value.teamId;
    if (teamId === null || options.length === 0) {
      return;
    }

    const selectedTeam = options.find(item => item.value === teamId);
    if (!selectedTeam) {
      model.value.teamId = null;
      return;
    }

    if (model.value.organizationId !== selectedTeam.organizationId) {
      model.value.organizationId = selectedTeam.organizationId;
    }
  },
  { deep: true }
);
</script>

<template>
  <FormModalWrapper
    v-model:visible="visible"
    :title="title"
    :read-only="isViewMode"
    @submit="handleSubmit"
    @close="closeDrawer"
  >
    <NForm :ref="naiveForm.formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
      <div class="form-row">
        <NFormItem :label="$t('page.user.userName')" path="userName">
          <NInput
            v-model:value="model.userName"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.user.userNamePlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('common.email')" path="email">
          <NInput
            v-model:value="model.email"
            :readonly="isViewMode"
            :placeholder="isViewMode ? '' : $t('page.user.emailPlaceholder')"
          />
        </NFormItem>
      </div>
      <div v-if="!isViewMode && operateType === 'add'" class="form-row">
        <NFormItem :label="$t('page.user.password')" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.user.passwordPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.user.confirmPassword')" path="confirmPassword">
          <NInput
            v-model:value="model.confirmPassword"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.user.confirmPasswordPlaceholder')"
          />
        </NFormItem>
      </div>
      <div v-if="!isViewMode && operateType === 'edit'" class="form-row">
        <NFormItem :label="$t('page.user.newPassword')" path="password">
          <NInput
            v-model:value="model.password"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.user.newPasswordPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.user.confirmNewPassword')" path="confirmPassword">
          <NInput
            v-model:value="model.confirmPassword"
            type="password"
            show-password-on="click"
            :placeholder="$t('page.user.confirmNewPasswordPlaceholder')"
          />
        </NFormItem>
      </div>
      <div class="form-row">
        <NFormItem :label="$t('common.role')" path="roleCode">
          <NInput v-if="isViewMode" :value="selectedRoleName" readonly placeholder="" />
          <NSelect
            v-else
            v-model:value="model.roleCode"
            filterable
            clearable
            :options="roleOptions"
            :placeholder="$t('common.selectRole')"
          />
        </NFormItem>
      </div>
      <div v-if="isViewMode || hasTenantScope" class="form-row">
        <NFormItem :label="$t('page.user.organization')" path="organizationId">
          <NInput v-if="isViewMode" :value="selectedOrganizationName" readonly placeholder="" />
          <NSelect
            v-else
            v-model:value="model.organizationId"
            clearable
            filterable
            :options="organizationOptions"
            :placeholder="$t('page.user.organizationPlaceholder')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.user.team')" path="teamId">
          <NInput v-if="isViewMode" :value="selectedTeamName" readonly placeholder="" />
          <NSelect
            v-else
            v-model:value="model.teamId"
            clearable
            filterable
            :options="filteredTeamOptions"
            :placeholder="$t('page.user.teamPlaceholder')"
          />
        </NFormItem>
      </div>
      <div class="form-row form-row--single">
        <NFormItem :label="$t('common.status')" path="status">
          <NTag v-if="isViewMode" :type="getEnableStatusTagType(model.status)">
            {{ getEnableStatusLabel(model.status) }}
          </NTag>
          <NRadioGroup v-else v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </NRadioGroup>
        </NFormItem>
      </div>
    </NForm>
  </FormModalWrapper>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  column-gap: 16px;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.form-row--single {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
</style>
