<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCalendarStore } from '@/stores/apps/calendar/calendar';

const panel = ref([0, 1, 2, 3, 4]);
const store = useCalendarStore();

const categoryColors = {
  todo: { color: '#e8b0a4', label: '할 일' },
  personal_plan: { color: '#f7eaa4', label: '개인 일정' },
  company_plan: { color: '#dde2a9', label: '전사 일정' },
  proposal_plan: { color: '#9ed7a9', label: '제안' },
  contract_plan: { color: '#a4cbe8', label: '계약' },
  sales_plan: { color: '#a4bbe1', label: '매출' },
  act: { color: '#a9acd8', label: '영업 활동' },
  estimate_plan: { color: '#ccd5db', label: '견적' },
};

const selectedCategory = computed({
  get: () => store.selectedCategory,
  set: (value) => store.setCategory(value)
});

const selectedStatus = computed({
  get: () => store.selectedStatus,
  set: (value) => store.setStatus(value)
});

const selectedCalendarCategories = computed<string[]>({
  get: () => {
    const categories = store.selectedCalendarCategory as string[];
    return categories;
  },
  set: (value: string[]) => {
    store.setCalendarCategory(value);
  }
});

function toggleCategory(key: string) {
  store.setCalendarCategory(key);
}
function filterReset() {
  store.resetFilters();
}
</script>

<template>
  <v-sheet class="pa-4 pt-1">
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel elevation="0">
        <v-expansion-panel-title class="font-weight-medium custom-accordion"> 분류 </v-expansion-panel-title>
        <v-expansion-panel-text class="acco-body">
          <v-row no-gutters>
            <v-col cols="12">
              <v-checkbox label="일정" v-model="selectedCategory" color="secondary" value="plan" hide-details />
            </v-col>
            <v-col cols="12">
              <v-checkbox label="할 일" v-model="selectedCategory" color="secondary" value="todo" hide-details />
            </v-col>
            <v-col cols="12">
              <v-checkbox label="영업활동" v-model="selectedCategory" color="secondary" value="act" hide-details />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel elevation="0">
        <v-expansion-panel-title class="font-weight-medium custom-accordion"> 상태 </v-expansion-panel-title>
        <v-expansion-panel-text class="acco-body">
          <v-row no-gutters>
            <v-col cols="12">
              <v-checkbox label="Todo" v-model="selectedStatus" color="primary" value="TODO" hide-details />
            </v-col>
            <v-col cols="12">
              <v-checkbox label="In Progress" v-model="selectedStatus" color="primary" value="INPROGRESS" hide-details />
            </v-col>
            <v-col cols="12">
              <v-checkbox label="Done" v-model="selectedStatus" color="primary" value="DONE" hide-details />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel elevation="0">
        <v-expansion-panel-title class="font-weight-medium custom-accordion"> 캘린더 구분 </v-expansion-panel-title>
        <v-expansion-panel-text class="acco-body">
          <div class="d-flex flex-wrap gap-2 v-col-11 px-0">
            <template v-for="(cat, key) in categoryColors" :key="key">
              <div class="d-flex align-items-center" style="min-width: 150px;">
                <v-avatar
                  class="cursor-pointer"
                  :color="cat.color"
                  variant="flat"
                  size="25"
                  style="border-radius: 8px;"
                  @click="toggleCategory(key)"
                >
              <v-icon 
                v-if="selectedCalendarCategories.includes(key)" 
                color="white" 
                style="position: absolute; top: 5px; right: 5px; font-size: 16px;">
                mdi-check
              </v-icon>
              </v-avatar>
                <span class="ml-2" style="min-width: 80px;">{{ cat.label }}</span>
              </div>
            </template>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn color="primary" @click="filterReset()" block class="mt-5">필터 초기화</v-btn>
  </v-sheet>
</template>

<style lang="scss">
.custom-accordion {
  padding: 18px 2px;
  min-height: 30px !important;
  .v-expansion-panel-title__overlay {
    background-color: transparent;
  }
}
.acco-body {
  .v-expansion-panel-text__wrapper {
    padding: 5px 0;
  }
}
.v-sheet {
  border-radius: 8px;
}
.acco-body {
  .d-flex {
    display: flex;
    align-items: center;
  }
  .ml-2 {
    margin-left: 10px;
  }
}
</style>
