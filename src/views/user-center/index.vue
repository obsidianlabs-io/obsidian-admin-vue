<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { REG_PWD } from '@/constants/reg';
import {
  fetchDisableTwoFactor,
  fetchEnableTwoFactor,
  fetchGetAuthSessions,
  fetchGetTimezoneOptions,
  fetchGetUserProfile,
  fetchRevokeAuthSession,
  fetchSetupTwoFactor,
  fetchUpdateAuthSessionAlias,
  fetchUpdateUserPreferences,
  fetchUpdateUserProfile
} from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';

defineOptions({
  name: 'UserCenterPage'
});

const authStore = useAuthStore();
const { formRef, validate, restoreValidation } = useNaiveForm();
const { formRules } = useFormRules();

const loading = ref(false);
const submitting = ref(false);
const profile = ref<Api.Auth.UserProfile | null>(null);
const timezoneOptions = ref<CommonType.Option<string>[]>([]);

// Two-Factor Auth State
const twoFactorEnabled = computed(() => profile.value?.twoFactorEnabled ?? false);
const twoFactorSetupVisible = ref(false);
const twoFactorOtpCode = ref('');
const twoFactorSecret = ref('');
const twoFactorQrCodeUrl = ref('');
const twoFactorLoading = ref(false);
const sessionsLoading = ref(false);
const sessionsRevokingId = ref('');
const authSessions = ref<Api.Auth.AuthSessionRecord[]>([]);
const singleDeviceLogin = ref<boolean | null>(null);
const sessionAliasVisible = ref(false);
const sessionAliasSubmitting = ref(false);
const sessionAliasTarget = reactive({
  sessionId: '',
  deviceAlias: ''
});

interface Model {
  userName: string;
  email: string;
  timezone: string;
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

const model = reactive<Model>({
  userName: '',
  email: '',
  timezone: 'UTC',
  currentPassword: '',
  password: '',
  confirmPassword: ''
});

const hasChanges = computed(() => {
  if (!profile.value) return false;

  const p = profile.value;
  return (
    model.userName !== p.userName ||
    model.email !== p.email ||
    model.timezone !== (p.timezone || 'UTC') ||
    model.currentPassword !== '' ||
    model.password !== '' ||
    model.confirmPassword !== ''
  );
});

type FormRuleKey = keyof Model;

const rules = computed<Record<FormRuleKey, App.Global.FormRule[]>>(() => {
  return {
    userName: formRules.userName,
    email: formRules.email,
    timezone: [],
    currentPassword: [
      {
        asyncValidator: (rule, value) => {
          if (model.password !== '' && String(value) === '') {
            return Promise.reject(rule.message);
          }

          return Promise.resolve();
        },
        message: $t('page.userCenter.currentPasswordRequired'),
        trigger: ['blur', 'input']
      }
    ],
    password: [
      {
        asyncValidator: (rule, value) => {
          const password = String(value);
          if (password === '') {
            return Promise.resolve();
          }

          if (!REG_PWD.test(password)) {
            return Promise.reject(rule.message);
          }

          return Promise.resolve();
        },
        message: $t('form.pwd.invalid'),
        trigger: ['blur', 'input']
      }
    ],
    confirmPassword: [
      {
        asyncValidator: (rule, value) => {
          const password = model.password;
          const confirmPassword = String(value);

          if (password === '' && confirmPassword === '') {
            return Promise.resolve();
          }

          if (password === '' && confirmPassword !== '') {
            return Promise.reject(rule.message);
          }

          if (password !== confirmPassword) {
            return Promise.reject(rule.message);
          }

          return Promise.resolve();
        },
        message: $t('form.confirmPwd.invalid'),
        trigger: ['blur', 'input']
      }
    ]
  };
});

function resetPasswordFields() {
  model.currentPassword = '';
  model.password = '';
  model.confirmPassword = '';
}

function resetProfileForm() {
  if (!profile.value) {
    return;
  }

  model.userName = profile.value.userName;
  model.email = profile.value.email;
  model.timezone = profile.value.timezone || 'UTC';
  resetPasswordFields();
  restoreValidation();
}

function formatSessionTime(value?: string) {
  return value && value.trim() !== '' ? value : $t('common.noData');
}

function formatSessionText(value?: string) {
  return value && value.trim() !== '' ? value : $t('common.noData');
}

function getSessionDisplayName(session: Api.Auth.AuthSessionRecord) {
  return formatSessionText(session.deviceAlias || session.deviceName);
}

function applyProfileToModel(data: Api.Auth.UserProfile) {
  profile.value = data;
  model.userName = data.userName;
  model.email = data.email;
  model.timezone = data.timezone || 'UTC';
  resetPasswordFields();
}

async function getProfile() {
  loading.value = true;

  const { data, error } = await fetchGetUserProfile();

  if (!error) {
    applyProfileToModel(data);
  }

  loading.value = false;
}

async function getTimezoneOptions() {
  const { data, error } = await fetchGetTimezoneOptions();

  if (error) {
    return;
  }

  timezoneOptions.value = data.records.map(item => ({
    label: item.label,
    value: item.timezone
  }));

  if (!model.timezone && data.defaultTimezone) {
    model.timezone = data.defaultTimezone;
  }
}

async function getAuthSessions() {
  sessionsLoading.value = true;

  try {
    const { data, error } = await fetchGetAuthSessions();

    if (!error && data) {
      authSessions.value = data.records || [];
      singleDeviceLogin.value = Boolean(data.singleDeviceLogin);
      return;
    }

    authSessions.value = [];
    singleDeviceLogin.value = null;
  } finally {
    sessionsLoading.value = false;
  }
}

async function handleSubmit() {
  await validate();

  submitting.value = true;
  const previousTimezone = profile.value?.timezone || 'UTC';

  const payload: Api.Auth.UpdateProfilePayload = {
    userName: model.userName.trim(),
    email: model.email.trim()
  };

  const password = model.password;
  if (password !== '') {
    payload.currentPassword = model.currentPassword;
    payload.password = password;
    payload.password_confirmation = model.confirmPassword;
  }

  const { data, error } = await fetchUpdateUserProfile(payload);

  if (!error) {
    let timezone = previousTimezone;
    let timezonePreferenceSaveFailed = false;
    const nextTimezone = model.timezone.trim();

    if (nextTimezone !== '' && nextTimezone !== previousTimezone) {
      const { data: preferenceData, error: preferenceError } = await fetchUpdateUserPreferences({
        timezone: nextTimezone
      });

      if (!preferenceError) {
        timezone = preferenceData.timezone || nextTimezone;
      } else {
        timezonePreferenceSaveFailed = true;
      }
    }

    applyProfileToModel({
      ...data,
      timezone
    });
    await authStore.initUserInfo();
    restoreValidation();

    if (timezonePreferenceSaveFailed) {
      window.$message?.warning($t('page.userCenter.profileUpdatePartialSuccess'));
    } else {
      window.$message?.success($t('common.updateSuccess'));
    }
  }

  submitting.value = false;
}

async function handleSetupTwoFactor() {
  twoFactorLoading.value = true;
  const { data, error } = await fetchSetupTwoFactor();
  if (!error && data) {
    twoFactorSecret.value = data.secret;
    twoFactorQrCodeUrl.value = data.otpauthUrl;
    twoFactorSetupVisible.value = true;
    twoFactorOtpCode.value = '';
  }
  twoFactorLoading.value = false;
}

function closeTwoFactorSetup() {
  twoFactorSetupVisible.value = false;
  twoFactorOtpCode.value = '';
}

async function handleConfirmTwoFactor() {
  if (!twoFactorOtpCode.value) {
    window.$message?.error($t('page.userCenter.twoFactor.otpMissing'));
    return;
  }
  twoFactorLoading.value = true;
  const { error } = await fetchEnableTwoFactor(twoFactorOtpCode.value);
  if (!error) {
    window.$message?.success($t('page.userCenter.twoFactor.enableSuccess'));
    twoFactorSetupVisible.value = false;
    await getProfile();
  }
  twoFactorLoading.value = false;
}

async function handleDisableTwoFactor() {
  if (!twoFactorOtpCode.value) {
    window.$message?.error($t('page.userCenter.twoFactor.otpMissing'));
    return;
  }
  twoFactorLoading.value = true;
  const { error } = await fetchDisableTwoFactor(twoFactorOtpCode.value);
  if (!error) {
    window.$message?.success($t('page.userCenter.twoFactor.disableSuccess'));
    twoFactorSetupVisible.value = false;
    twoFactorOtpCode.value = '';
    await getProfile();
  }
  twoFactorLoading.value = false;
}

async function handleRevokeAuthSession(session: Api.Auth.AuthSessionRecord) {
  if (!session.sessionId || sessionsRevokingId.value) {
    return;
  }

  sessionsRevokingId.value = session.sessionId;

  const { data, error } = await fetchRevokeAuthSession(session.sessionId);

  if (!error && data) {
    window.$message?.success($t('page.userCenter.sessions.revokeSuccess'));

    if (data.revokedCurrentSession) {
      await authStore.resetStore();
      sessionsRevokingId.value = '';
      return;
    }

    await getAuthSessions();
  }

  sessionsRevokingId.value = '';
}

function openSessionAliasModal(session: Api.Auth.AuthSessionRecord) {
  sessionAliasTarget.sessionId = session.sessionId;
  sessionAliasTarget.deviceAlias = (session.deviceAlias || '').trim();
  sessionAliasVisible.value = true;
}

function closeSessionAliasModal() {
  if (sessionAliasSubmitting.value) {
    return;
  }

  sessionAliasVisible.value = false;
  sessionAliasTarget.sessionId = '';
  sessionAliasTarget.deviceAlias = '';
}

async function handleSubmitSessionAlias() {
  if (!sessionAliasTarget.sessionId) {
    return;
  }

  sessionAliasSubmitting.value = true;

  const { error } = await fetchUpdateAuthSessionAlias(sessionAliasTarget.sessionId, {
    deviceAlias: sessionAliasTarget.deviceAlias.trim() || undefined
  });

  if (!error) {
    window.$message?.success($t('page.userCenter.sessions.renameSuccess'));
    sessionAliasSubmitting.value = false;
    closeSessionAliasModal();
    await getAuthSessions();
    return;
  }

  sessionAliasSubmitting.value = false;
}

onMounted(() => {
  getProfile();
  getTimezoneOptions();
  getAuthSessions();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-x-hidden overflow-y-auto">
    <NCard :title="$t('common.userCenter')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <NSpace :size="12" align="center">
          <NButton size="small" :disabled="!hasChanges" @click="resetProfileForm">
            <template #icon>
              <icon-mdi-restore class="text-icon" />
            </template>
            {{ $t('common.reset') }}
          </NButton>
          <NButton size="small" type="primary" :disabled="!hasChanges" :loading="submitting" @click="handleSubmit">
            <template #icon>
              <icon-mdi-content-save-edit-outline class="text-icon" />
            </template>
            {{ $t('common.update') }}
          </NButton>
          <NButton size="small" @click="getProfile">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
        </NSpace>
      </template>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="top">
          <div class="form-row">
            <NFormItem :label="$t('page.user.userName')" path="userName">
              <NInput v-model:value="model.userName" :placeholder="$t('page.user.userNamePlaceholder')" />
            </NFormItem>
            <NFormItem :label="$t('common.email')" path="email">
              <NInput v-model:value="model.email" :placeholder="$t('page.user.emailPlaceholder')" />
            </NFormItem>
          </div>

          <div class="form-row">
            <NFormItem :label="$t('common.timezone')">
              <NSelect
                v-model:value="model.timezone"
                filterable
                :placeholder="$t('common.selectTimezone')"
                :options="timezoneOptions"
              />
            </NFormItem>
          </div>
        </NForm>
      </NSpin>
    </NCard>

    <NCard :bordered="false" size="small" class="card-wrapper">
      <NCollapse>
        <NCollapseItem :title="$t('page.userCenter.changePassword')" name="password">
          <template #header-extra>
            <span class="text-12px text-gray-400">{{ $t('page.userCenter.passwordHint') }}</span>
          </template>
          <NForm :model="model" :rules="rules" label-placement="top" :show-require-mark="false">
            <div class="form-row">
              <NFormItem :label="$t('page.userCenter.currentPassword')" path="currentPassword">
                <NInput
                  v-model:value="model.currentPassword"
                  type="password"
                  show-password-on="click"
                  :placeholder="$t('page.userCenter.currentPasswordPlaceholder')"
                />
              </NFormItem>
            </div>

            <div class="form-row">
              <NFormItem :label="$t('page.user.newPassword')" path="password">
                <NInput
                  v-model:value="model.password"
                  type="password"
                  show-password-on="click"
                  :placeholder="$t('page.userCenter.newPasswordPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="$t('page.user.confirmNewPassword')" path="confirmPassword">
                <NInput
                  v-model:value="model.confirmPassword"
                  type="password"
                  show-password-on="click"
                  :placeholder="$t('page.userCenter.confirmNewPasswordPlaceholder')"
                />
              </NFormItem>
            </div>
          </NForm>
        </NCollapseItem>

        <NCollapseItem :title="$t('page.userCenter.twoFactor.title')" name="two-factor">
          <template #header-extra>
            <NTag :type="twoFactorEnabled ? 'success' : 'warning'" size="small">
              {{
                twoFactorEnabled ? $t('page.userCenter.twoFactor.enabled') : $t('page.userCenter.twoFactor.disabled')
              }}
            </NTag>
          </template>

          <div class="mt-4 flex-col gap-16px">
            <NAlert :type="twoFactorEnabled ? 'success' : 'info'">
              {{
                twoFactorEnabled
                  ? $t('page.userCenter.twoFactor.activeInfo')
                  : $t('page.userCenter.twoFactor.inactiveInfo')
              }}
            </NAlert>
            <div>
              <NButton
                v-if="!twoFactorEnabled"
                type="primary"
                :loading="twoFactorLoading"
                @click="handleSetupTwoFactor"
              >
                {{ $t('page.userCenter.twoFactor.enableBtn') }}
              </NButton>
              <NButton v-else type="error" @click="twoFactorSetupVisible = true">
                {{ $t('page.userCenter.twoFactor.disableBtn') }}
              </NButton>
            </div>
          </div>
        </NCollapseItem>

        <NCollapseItem :title="$t('page.userCenter.sessions.title')" name="sessions">
          <template #header-extra>
            <div class="flex items-center gap-8px">
              <NTag
                v-if="singleDeviceLogin !== null"
                size="small"
                :type="singleDeviceLogin ? 'warning' : 'info'"
                :bordered="false"
              >
                {{
                  singleDeviceLogin
                    ? $t('page.userCenter.sessions.singleDeviceMode')
                    : $t('page.userCenter.sessions.multiDeviceMode')
                }}
              </NTag>
              <NTag size="small" type="default" :bordered="false">
                {{ authSessions.length }}
              </NTag>
            </div>
          </template>

          <div class="mb-12px flex items-center justify-between gap-12px">
            <div class="user-center-subtle-text">
              {{ $t('page.userCenter.sessions.hint') }}
            </div>
            <NButton size="small" :loading="sessionsLoading" @click="getAuthSessions">
              <template #icon>
                <icon-mdi-refresh class="text-icon" />
              </template>
              {{ $t('common.refresh') }}
            </NButton>
          </div>

          <NSpin :show="sessionsLoading">
            <div v-if="authSessions.length === 0" class="py-12px">
              <NEmpty :description="$t('page.userCenter.sessions.empty')" size="small" />
            </div>

            <div v-else class="flex-col gap-12px">
              <NCard
                v-for="session in authSessions"
                :key="session.sessionId"
                size="small"
                embedded
                class="session-card"
              >
                <div class="flex flex-wrap items-center justify-between gap-12px">
                  <div class="min-w-0">
                    <div class="mb-6px flex flex-wrap items-center gap-8px">
                      <span class="session-title-text">{{ getSessionDisplayName(session) }}</span>
                      <NTag v-if="session.deviceAlias" size="small" type="success" :bordered="false">
                        {{ $t('page.userCenter.sessions.customAlias') }}
                      </NTag>
                      <NTag v-if="session.deviceType" size="small" :bordered="false" type="default" class="capitalize">
                        {{ session.deviceType }}
                      </NTag>
                      <NTag v-if="session.browser" size="small" :bordered="false" type="info">
                        {{ session.browser }}
                      </NTag>
                      <NTag v-if="session.os" size="small" :bordered="false" type="default">
                        {{ session.os }}
                      </NTag>
                    </div>
                    <div v-if="session.deviceAlias && session.deviceName" class="session-secondary-text mb-6px">
                      {{ formatSessionText(session.deviceName) }}
                    </div>
                    <div class="mb-6px flex flex-wrap items-center gap-8px">
                      <span class="session-inline-label">{{ $t('page.userCenter.sessions.sessionId') }}</span>
                      <span class="session-id-chip">{{ session.sessionId }}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-8px">
                      <NTag v-if="session.current" type="success" size="small" :bordered="false">
                        {{ $t('page.userCenter.sessions.current') }}
                      </NTag>
                      <NTag v-if="session.rememberMe" type="info" size="small" :bordered="false">
                        {{ $t('page.userCenter.sessions.rememberMe') }}
                      </NTag>
                      <NTag v-if="session.legacy" type="warning" size="small" :bordered="false">
                        {{ $t('page.userCenter.sessions.legacySession') }}
                      </NTag>
                      <NTag size="small" :bordered="false">
                        {{ $t('page.userCenter.sessions.tokenCount', { count: String(session.tokenCount) }) }}
                      </NTag>
                    </div>
                  </div>

                  <div class="flex items-center gap-8px">
                    <NButton
                      size="small"
                      type="primary"
                      ghost
                      class="session-action-btn"
                      :disabled="Boolean(sessionsRevokingId) || sessionAliasSubmitting"
                      @click="openSessionAliasModal(session)"
                    >
                      <template #icon>
                        <icon-mdi-pencil-outline class="text-icon" />
                      </template>
                      {{ $t('page.userCenter.sessions.rename') }}
                    </NButton>

                    <NPopconfirm @positive-click="handleRevokeAuthSession(session)">
                      <template #trigger>
                        <NButton
                          size="small"
                          type="error"
                          ghost
                          class="session-action-btn"
                          :loading="sessionsRevokingId === session.sessionId"
                          :disabled="
                            (Boolean(sessionsRevokingId) && sessionsRevokingId !== session.sessionId) ||
                            sessionAliasSubmitting
                          "
                        >
                          {{
                            session.current
                              ? $t('page.userCenter.sessions.revokeCurrent')
                              : $t('page.userCenter.sessions.revoke')
                          }}
                        </NButton>
                      </template>
                      {{
                        session.current
                          ? $t('page.userCenter.sessions.revokeCurrentConfirm')
                          : $t('page.userCenter.sessions.revokeConfirm')
                      }}
                    </NPopconfirm>
                  </div>
                </div>

                <div class="session-meta-grid">
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('common.createdAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.createdAt) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.lastUsedAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.lastUsedAt) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.lastAccessUsedAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.lastAccessUsedAt) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.lastRefreshUsedAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.lastRefreshUsedAt) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.ipAddress') }}</span>
                    <span class="session-meta-value break-all">{{ formatSessionText(session.ipAddress) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.accessExpiresAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.accessTokenExpiresAt) }}</span>
                  </div>
                  <div class="session-meta-item">
                    <span class="session-meta-label">{{ $t('page.userCenter.sessions.refreshExpiresAt') }}</span>
                    <span class="session-meta-value">{{ formatSessionTime(session.refreshTokenExpiresAt) }}</span>
                  </div>
                </div>
              </NCard>
            </div>
          </NSpin>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <FormModalWrapper
      v-model:visible="sessionAliasVisible"
      :title="$t('page.userCenter.sessions.renameTitle')"
      :loading="sessionAliasSubmitting"
      @close="closeSessionAliasModal"
      @submit="handleSubmitSessionAlias"
    >
      <div class="user-center-subtle-text mb-8px">
        {{ $t('page.userCenter.sessions.renameHint') }}
      </div>
      <NFormItem :label="$t('page.userCenter.sessions.aliasLabel')" :show-require-mark="false">
        <NInput
          v-model:value="sessionAliasTarget.deviceAlias"
          :maxlength="80"
          clearable
          :placeholder="$t('page.userCenter.sessions.aliasPlaceholder')"
        />
      </NFormItem>
    </FormModalWrapper>

    <FormModalWrapper
      v-model:visible="twoFactorSetupVisible"
      :title="twoFactorEnabled ? $t('page.userCenter.twoFactor.disableBtn') : $t('page.userCenter.twoFactor.enableBtn')"
      :loading="twoFactorLoading"
      @close="closeTwoFactorSetup"
      @submit="twoFactorEnabled ? handleDisableTwoFactor() : handleConfirmTwoFactor()"
    >
      <div v-if="!twoFactorEnabled" class="mb-4 flex-center flex-col gap-16px">
        <h3>{{ $t('page.userCenter.twoFactor.scanTitle') }}</h3>
        <div class="rd-8px bg-white p-4">
          <QrcodeVue :value="twoFactorQrCodeUrl" :size="200" level="H" />
        </div>
        <p class="text-14px text-gray-500">
          {{ $t('page.userCenter.twoFactor.manualSecret') }}
          <strong>{{ twoFactorSecret }}</strong>
        </p>
      </div>

      <div v-if="twoFactorEnabled" class="mb-4">
        <NAlert type="warning">{{ $t('page.userCenter.twoFactor.disableWarning') }}</NAlert>
      </div>

      <NFormItem :label="$t('page.userCenter.twoFactor.otpCode')" required>
        <NInput
          v-model:value="twoFactorOtpCode"
          :placeholder="$t('page.userCenter.twoFactor.otpPlaceholder')"
          maxlength="6"
          autofocus
          @keyup.enter="twoFactorEnabled ? handleDisableTwoFactor() : handleConfirmTwoFactor()"
        />
      </NFormItem>
    </FormModalWrapper>
  </div>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  column-gap: 16px;
}

.user-center-subtle-text {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.session-card {
  border: 1px solid var(--n-border-color);
  border-radius: 10px;
}

.session-card :deep(.n-card__content) {
  padding: 12px 14px;
}

.session-title-text {
  color: var(--n-text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.session-secondary-text {
  color: var(--n-text-color-3);
  font-size: 12px;
  line-height: 1.35;
}

.session-inline-label {
  color: var(--n-text-color-2);
  font-size: 13px;
  font-weight: 600;
}

.session-id-chip {
  max-width: 100%;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  background-color: var(--n-color-embedded);
  color: var(--n-text-color-2);
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
}

.session-action-btn {
  font-weight: 500;
}

.session-meta-grid {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  border-top: 1px solid var(--n-border-color);
  padding-top: 12px;
}

.session-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.session-meta-label {
  color: var(--n-text-color-3);
}

.session-meta-value {
  color: var(--n-text-color-2);
  word-break: break-word;
}

@media (min-width: 768px) {
  .form-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .session-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
