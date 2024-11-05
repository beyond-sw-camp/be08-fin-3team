<script setup lang="ts">
import { ref } from 'vue';
import ChatUserActRatio from './ActChatUserRatio.vue';
import ActChartCount from './ActChartCount.vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ActChartClsCount from './ActChartClsCount.vue';

const page = ref({ title: '차트' });
const breadcrumbs = ref([
    { text: '차트', disabled: false, href: '#' },
    { text: '활동 차트', disabled: true, href: '#' }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
                <v-col cols="12" lg="6">
                    <!-- Donut Chart -->
                    <UiParentCard title="영업사원별 활동 비율">
                      <ChatUserActRatio/>
                    </UiParentCard>
                </v-col>
            
                <v-col cols="12">
                    <!-- AREA Chart -->
                    <UiParentCard title="월별 영업활동 추이">
                      <ActChartCount/>
                    </UiParentCard>
                </v-col>
                <v-col cols="12">
                    <!-- Colunm Chart -->
                    <UiParentCard title="활동 분류별 집계">
                      <ActChartClsCount/>
                    </UiParentCard>
                </v-col>
            </v-col>
    </v-row>
</template>
