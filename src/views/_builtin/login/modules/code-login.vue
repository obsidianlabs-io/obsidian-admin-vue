<script setup lang="ts">
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({
  name: 'CodeLogin'
});

const { toggleLoginModule } = useRouterPush();
</script>

<template>
  <NSpace vertical :size="18" class="w-full">
    <NAlert type="info" :bordered="false">
      {{ $t('page.login.codeLogin.placeholderNotice') }}
    </NAlert>

    <NButton type="primary" size="large" round block @click="toggleLoginModule('pwd-login')">
      {{ $t('page.login.common.back') }}
    </NButton>
  </NSpace>
</template>

<style scoped></style>
