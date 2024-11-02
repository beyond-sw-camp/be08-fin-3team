<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ContractDetailView from './ContractDetailView.vue';
import ContractFilterView from './ContractFilterView.vue';
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

interface FilterCriteria {
    name: string;
    startDate: string;
    endDate: string;
}

const filterCriteria = ref<FilterCriteria>({
    name: '',
    startDate: '',
    endDate: ''
});

</script>

<template>
    <BaseBreadcrumb :title="page.title"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12" md="4">
            <v-card>
                <ContractFilterView v-model="filterCriteria" />
            </v-card>
        </v-col>
        <v-col cols="12" md="8">
            <v-card style="padding: 20px;">
                <ContractDetailView :filter="filterCriteria" />
            </v-card>
        </v-col>
    </v-row>
</template>
