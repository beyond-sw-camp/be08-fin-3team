<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

//Table
import PlanEditable from '../../../components/apps/plan/PlanEditable.vue'

// theme breadcrumb
const page = ref({ title: '일정 목록' });
const breadcrumbs = ref([
    {
        text: '일정 관리',
        disabled: false,
        href: '#'
    },
    {
        text: '일정',
        disabled: true,
        href: '#'
    }
]);
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="일정 목록">
                <PlanEditable />
            </UiParentCard>
        </v-col>
    </v-row>
</template>
