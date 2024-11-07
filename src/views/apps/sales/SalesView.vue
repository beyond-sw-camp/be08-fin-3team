<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import SalesDetailView from './SalesDetailView.vue';
import SalesFilterView from './SalesFilterView.vue';

const page = ref({ title: '매출 정보' });

interface FilterCriteria {
    salesName: string,
    businessType: string,
    taxClassification: string,
    startDate: string,
    endDate: string
}

const filterCriteria = ref<FilterCriteria>({
    salesName: '',
    businessType: '',
    taxClassification: '',
    startDate: '',
    endDate: ''
});

// const applyFilter = (criteria: { salesName: string; businessType: string; taxClassification: string; startDate: string; endDate: string; }) => {
//     filterCriteria.value = criteria;
// };
</script>

<template>
    <BaseBreadcrumb :title="page.title" />
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="2">
                <v-card>
                    <SalesFilterView v-model="filterCriteria"  />
                </v-card>
            </v-col>
            <v-col cols="12" md="10">
                <v-card style="padding: 20px;">
                    <SalesDetailView :filter="filterCriteria" />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
