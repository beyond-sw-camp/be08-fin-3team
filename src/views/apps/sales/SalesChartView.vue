<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { defineAsyncComponent } from 'vue';

// 비동기 컴포넌트 로드 방식
const SalesStatusChartView = defineAsyncComponent(() => import('./SalesStatusChartView.vue'));
const SalesPredictionChartView = defineAsyncComponent(() => import('./SalesPredictionChartView.vue'));

const breadcrumbs = ref([
    {
        text: 'Chart',
        disabled: false,
        href: 'sales'
    },
    {
        text: 'Sales Chart',
        disabled: true,
        href: '#'
    }
]);

const page = ref({ title: '매출 분석 차트' });

const selectedOption = ref('monthlySales');  

const chartOptions = [
    { text: '년도별 매출 현황', value: 'monthlySales' },
    { text: '매출 예측 차트', value: 'salesPrediction' }
];  

const currentChartView = ref(SalesStatusChartView); 

const onChartChange = (value: string) => {
    currentChartView.value = value === 'monthlySales' 
        ? SalesStatusChartView 
        : SalesPredictionChartView;
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
    <v-row>
        <v-col cols="12" md="4">
            <v-select
                v-model="selectedOption" 
                :items="chartOptions"
                item-text="text"  
                item-value="value"  
                label="차트 선택"
                @change="onChartChange"
                outlined
            />
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12">
            <UiParentCard v-if="currentChartView">
                <component :is="currentChartView" /> 
            </UiParentCard>
        </v-col>
    </v-row>
</template>
