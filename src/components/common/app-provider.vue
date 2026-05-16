<script setup lang="ts">
import { createTextVNode, defineComponent } from 'vue';
import { useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui';
import { registerNaiveProviders } from '@/utils/naive-ui';

defineOptions({
  name: 'AppProvider'
});

const ContextHolder = defineComponent({
  name: 'ContextHolder',
  setup() {
    function register() {
      const loadingBar = useLoadingBar();
      const dialog = useDialog();
      const message = useMessage();
      const notification = useNotification();

      registerNaiveProviders({ loadingBar, dialog, message, notification });

      // Keep window references for backward compatibility during gradual migration
      window.$loadingBar = loadingBar;
      window.$dialog = dialog;
      window.$message = message;
      window.$notification = notification;
    }

    register();

    return () => createTextVNode();
  }
});
</script>

<template>
  <NLoadingBarProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <ContextHolder />
          <slot></slot>
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NLoadingBarProvider>
</template>

<style scoped></style>
