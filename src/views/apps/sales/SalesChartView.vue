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
        text: '차트',
        disabled: false,
        href: 'sales'
    },
    {
        text: '매출 차트',
        disabled: true,
        href: '#'
    }
]);

const page = ref({ title: '매출 분석 차트' });

const selectedOption = ref('monthlySales');  // v-model과 직접 연결된 값

const chartOptions = [
    { text: '년도별 매출 현황', value: 'monthlySales' },
    { text: '매출 예측 차트', value: 'salesPrediction' }
];  // 드롭다운에서 사용할 items 배열

const currentChartView = ref(SalesStatusChartView);  // 초기값 설정

// 드롭다운 변경 시 호출되는 함수
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
