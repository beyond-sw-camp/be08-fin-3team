<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(['agree', 'disagree', 'update:dialog']);

const closeDialog = () => {
  emit('disagree');
  emit('update:dialog', false);
};
const agreeDialog = () => {
  emit('agree');
  emit('update:dialog', false);
};
</script>

<template>
  <div class="text-center">
    <v-dialog v-bind:model-value="dialog" @update:model-value="(val) => emit('update:dialog', val)" persistent max-width="400px">
      <v-card class="pa-6">
        <v-card-title class="text-h4 font-weight-bold d-flex align-center">
          <v-icon size="40" class="mr-2" color="error">mdi-alert-circle</v-icon>
          삭제 경고
        </v-card-title>
        <v-card-text class="text-h5">정말 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" flat style="font-size: 16px; font-weight: 600;" @click="agreeDialog">삭제</v-btn>
          <v-btn color="green darken-1" variant="text" flat style="font-size: 16px; font-weight: 600;" @click="closeDialog">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.dialog-mw {
  max-width: 400px; /* 가로폭 제한 */
}
</style>
