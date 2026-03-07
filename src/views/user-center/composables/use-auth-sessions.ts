import { reactive, ref } from 'vue';
import { fetchGetAuthSessions, fetchRevokeAuthSession, fetchUpdateAuthSessionAlias } from '@/service/api';
import type { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

interface UseAuthSessionsOptions {
  authStore: ReturnType<typeof useAuthStore>;
}

export function useAuthSessions(options: UseAuthSessionsOptions) {
  const { authStore } = options;

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

  function formatSessionTime(value?: string) {
    return value && value.trim() !== '' ? value : $t('common.noData');
  }

  function formatSessionText(value?: string) {
    return value && value.trim() !== '' ? value : $t('common.noData');
  }

  function getSessionDisplayName(session: Api.Auth.AuthSessionRecord) {
    return formatSessionText(session.deviceAlias || session.deviceName);
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

  async function handleRevokeAuthSession(session: Api.Auth.AuthSessionRecord) {
    if (!session.sessionId || sessionsRevokingId.value) {
      return;
    }

    sessionsRevokingId.value = session.sessionId;
    try {
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
    } finally {
      sessionsRevokingId.value = '';
    }
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
    try {
      const { error } = await fetchUpdateAuthSessionAlias(sessionAliasTarget.sessionId, {
        deviceAlias: sessionAliasTarget.deviceAlias.trim() || undefined
      });

      if (!error) {
        window.$message?.success($t('page.userCenter.sessions.renameSuccess'));
        sessionAliasSubmitting.value = false;
        closeSessionAliasModal();
        await getAuthSessions();
      }
    } finally {
      sessionAliasSubmitting.value = false;
    }
  }

  return {
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
  };
}
