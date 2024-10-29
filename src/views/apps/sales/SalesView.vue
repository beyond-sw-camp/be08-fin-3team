<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import SalesDetailView from './SalesDetailView.vue';
import SalesFilterView from './SalesFilterView.vue';

const page = ref({ title: '매출 정보' });
const filterCriteria = ref({
    salesName: '',
    businessType: '',
    taxClassification: '',
    startDate: '',
    endDate: ''
});

const applyFilter = (criteria: { salesName: string; businessType: string; taxClassification: string; startDate: string; endDate: string; }) => {
    filterCriteria.value = criteria;
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" />
    <v-row>
        <v-col cols="12" md="4">
            <v-card>
                <SalesFilterView v-model="filterCriteria" @update:modelValue="applyFilter" />
            </v-card>
        </v-col>
        <v-col cols="12" md="8">
            <v-card style="padding: 20px;">
                <SalesDetailView :filter="filterCriteria" />
            </v-card>
        </v-col>
    </v-row>
</template>
