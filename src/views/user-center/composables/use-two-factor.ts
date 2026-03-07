import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { fetchDisableTwoFactor, fetchEnableTwoFactor, fetchSetupTwoFactor } from '@/service/api';
import { $t } from '@/locales';

interface UseTwoFactorOptions {
  profile: Ref<Api.Auth.UserProfile | null>;
  reloadProfile: () => Promise<void>;
}

export function useTwoFactor(options: UseTwoFactorOptions) {
  const { profile, reloadProfile } = options;

  const twoFactorEnabled = computed(() => profile.value?.twoFactorEnabled ?? false);
  const twoFactorSetupVisible = ref(false);
  const twoFactorOtpCode = ref('');
  const twoFactorSecret = ref('');
  const twoFactorQrCodeUrl = ref('');
  const twoFactorLoading = ref(false);

  async function handleSetupTwoFactor() {
    twoFactorLoading.value = true;
    try {
      const { data, error } = await fetchSetupTwoFactor();
      if (!error && data) {
        twoFactorSecret.value = data.secret;
        twoFactorQrCodeUrl.value = data.otpauthUrl;
        twoFactorSetupVisible.value = true;
        twoFactorOtpCode.value = '';
      }
    } finally {
      twoFactorLoading.value = false;
    }
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
    try {
      const { error } = await fetchEnableTwoFactor(twoFactorOtpCode.value);
      if (!error) {
        window.$message?.success($t('page.userCenter.twoFactor.enableSuccess'));
        twoFactorSetupVisible.value = false;
        await reloadProfile();
      }
    } finally {
      twoFactorLoading.value = false;
    }
  }

  async function handleDisableTwoFactor() {
    if (!twoFactorOtpCode.value) {
      window.$message?.error($t('page.userCenter.twoFactor.otpMissing'));
      return;
    }

    twoFactorLoading.value = true;
    try {
      const { error } = await fetchDisableTwoFactor(twoFactorOtpCode.value);
      if (!error) {
        window.$message?.success($t('page.userCenter.twoFactor.disableSuccess'));
        twoFactorSetupVisible.value = false;
        twoFactorOtpCode.value = '';
        await reloadProfile();
      }
    } finally {
      twoFactorLoading.value = false;
    }
  }

  return {
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
  };
}
