<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { getEnableStatusLabel, getEnableStatusOptions, getEnableStatusTagType } from '@/constants/common';
import { fetchCreateUser, fetchGetAllRoles, fetchUpdateUser } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

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

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule, patternRules } = useFormRules();

const isViewMode = computed(() => Boolean(props.readOnly));
const enableStatusOptions = computed(() => getEnableStatusOptions());

const title = computed(() => {
  if (isViewMode.value) {
    return $t('page.user.viewTitle');
  }

  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.user.addTitle'),
    edit: $t('page.user.editTitle')
  };

  return titles[props.operateType];
});

type Model = Pick<Api.User.UserRecord, 'userName' | 'email' | 'status'>;
type UserFormModel = Model & { roleCode: string | null; password: string; confirmPassword: string };

const model = ref<UserFormModel>(createDefaultModel());

function createDefaultModel(): UserFormModel {
  return {
    userName: '',
    email: '',
    roleCode: null,
    password: '',
    confirmPassword: '',
    status: '1'
  };
}

const roleOptions = ref<CommonType.Option<string>[]>([]);

const selectedRoleName = computed(() => {
  const roleCode = model.value.roleCode || props.rowData?.roleCode || '';
  const role = roleOptions.value.find(item => item.value === roleCode);

  return role?.label || props.rowData?.roleName || $t('common.noData');
});

const rules = computed<
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

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
    model.value.roleCode = props.rowData.roleCode ?? null;
  }
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

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (isViewMode.value) {
    return;
  }

  await validate();

  const roleCode = model.value.roleCode || '';
  const payload: Api.User.UserPayload = {
    userName: model.value.userName.trim(),
    email: model.value.email.trim(),
    roleCode,
    status: model.value.status
  };

  const password = model.value.password;
  if (props.operateType === 'add') {
    payload.password = password;
  } else if (password !== '') {
    payload.password = password;
  }

  const { error } =
    props.operateType === 'add'
      ? await fetchCreateUser(payload)
      : await fetchUpdateUser(props.rowData?.id || 0, payload);

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
    if (!isViewMode.value) {
      getRoleOptions();
    }
  }
});
</script>

<template>
  <FormModalWrapper
    v-model:visible="visible"
    :title="title"
    :read-only="isViewMode"
    @submit="handleSubmit"
    @close="closeDrawer"
  >
    <NForm ref="formRef" :model="model" :rules="rules" :show-require-mark="!isViewMode">
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
