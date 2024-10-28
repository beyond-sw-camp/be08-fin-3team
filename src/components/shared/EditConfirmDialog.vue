<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  dialog: Boolean, // 다이얼로그 표시 여부
  message: {
    type: String,
    default: '이 항목을 수정하시겠습니까?'
  },
});

const emit = defineEmits(['confirm', 'close', 'update:dialog']);

const closeDialog = () => {
  emit('close');
  emit('update:dialog', false);
};

const confirmDialog = () => {
  emit('confirm');
  emit('update:dialog', false);
};
</script>

<template>
  <v-dialog v-bind:model-value="dialog" persistent max-width="400px">
    <v-card class="pa-6">
        <v-card-title class="text-h4 font-weight-bold d-flex align-center">
        <v-icon size="40" class="mr-2" color="info">mdi-pencil</v-icon>
        수정 확인
      </v-card-title>
      <v-card-text class="text-h5">{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="info" variant="text" flat style="font-size: 16px; font-weight: 600;" @click="confirmDialog">수정</v-btn>
        <v-btn color="grey darken-1" variant="text" flat style="font-size: 16px; font-weight: 600;" @click="closeDialog">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dialog-mw {
  max-width: 400px;
}
</style>
