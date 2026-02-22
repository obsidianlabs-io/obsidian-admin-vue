<script setup lang="ts">
import { computed } from 'vue';
import { commonFormModalBodyStyle, commonFormModalStyle } from '@/constants/common';
import { $t } from '@/locales';

defineOptions({
  name: 'FormModalWrapper'
});

interface Props {
  /** The title of the modal */
  title: string;
  /** Whether the modal is in view-only mode */
  readOnly?: boolean;
  /** CSS class for the modal wrapper */
  wrapperClass?: string;
  /** Whether the submit button is loading */
  loading?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'close'): void;
  (e: 'submit'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const isViewMode = computed(() => Boolean(props.readOnly));

function handleClose() {
  emit('close');
}

function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="title"
    :style="commonFormModalStyle"
    :mask-closable="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    closable
    display-directive="show"
    :class="wrapperClass"
  >
    <div :style="commonFormModalBodyStyle" :class="{ 'view-mode-form': isViewMode }">
      <slot></slot>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <NSpace :size="12">
          <NButton @click="handleClose">{{ isViewMode ? $t('common.close') : $t('common.cancel') }}</NButton>
          <NButton v-if="!isViewMode" type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('common.confirm') }}
          </NButton>
        </NSpace>
      </div>
    </template>
  </NModal>
</template>

<style scoped></style>
