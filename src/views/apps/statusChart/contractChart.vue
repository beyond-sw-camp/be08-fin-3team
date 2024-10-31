<script setup lang="ts">
import { ref } from 'vue';
import ContractChartClsCount from './ContractChartClsCount.vue';
import ContractChartAmt from './ContractChartAmt.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '차트' });
const breadcrumbs = ref([
    { text: '차트', disabled: false, href: '#' },
    { text: '계약 현황 차트', disabled: true, href: '#' }
]);
</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <!-- AREA Chart -->
            <UiParentCard title="월별 계약 총액 집계">
                <ContractChartAmt />
            </UiParentCard>
        </v-col>

        <v-col cols="12">
            <!-- Colunm Chart -->
            <UiParentCard title="월별 계약 현황 집계">
                <ContractChartClsCount />
            </UiParentCard>
        </v-col>
    </v-row>
</template>
