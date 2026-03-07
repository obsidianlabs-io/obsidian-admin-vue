<script setup lang="ts">
import { onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import FormModalWrapper from '@/components/advanced/form-modal-wrapper.vue';
import { useAuthSessions } from './composables/use-auth-sessions';
import { useProfileForm } from './composables/use-profile-form';
import { useTwoFactor } from './composables/use-two-factor';

defineOptions({
  name: 'UserCenterPage'
});

const authStore = useAuthStore();
const naiveForm = useNaiveForm();
const { formRules } = useFormRules();

const {
  loading,
  submitting,
  profile,
  timezoneOptions,
  model,
  rules,
  hasChanges,
  resetProfileForm,
  getProfile,
  getTimezoneOptions,
  handleSubmit
} = useProfileForm({
  authStore,
  naiveForm,
  formRules
});

const {
  twoFactorEnabled,
  twoFactorSetupVisible,
  twoFactorOtpCode,
  twoFactorSecret,
  twoFactorQrCodeUrl,
  twoFactorLoading,
  handleSetupTwoFactor,
  closeTwoFactorSetup,
  handleConfirmTwoFactor,
  handleDisableTwoFactor
} = useTwoFactor({
  profile,
  reloadProfile: getProfile
});

const {
  sessionsLoading,
  sessionsRevokingId,
  authSessions,
  singleDeviceLogin,
  sessionAliasVisible,
  sessionAliasSubmitting,
  sessionAliasTarget,
  formatSessionTime,
  formatSessionText,
  getSessionDisplayName,
  getAuthSessions,
  handleRevokeAuthSession,
  openSessionAliasModal,
  closeSessionAliasModal,
  handleSubmitSessionAlias
} = useAuthSessions({
  authStore
});

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
        <NForm :ref="naiveForm.formRef" :model="model" :rules="rules" label-placement="top">
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
