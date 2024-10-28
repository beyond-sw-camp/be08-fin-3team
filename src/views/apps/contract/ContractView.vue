<script setup lang="ts">
import { ref } from 'vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ContractDetailView from './ContractDetailView.vue';
// theme breadcrumb
const page = ref({ title: '계약 목록' });
const breadcrumbs = ref([
{
	text: '영업관리',
	disabled: false,
	to: '#'
},
{
	text: '계약',
	disabled: true,
	to: ''
	},
]);


</script>

<template>
  <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <ContractDetailView/>
        </v-card-text>
    </v-card>
</template>
