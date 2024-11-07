<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axiosinterceptor';

const elementVisible = ref(false);
const totalContractAmount = ref<number>(0);

const chartOptions = computed(() => ({
    series: [
        {
            name: 'Contract Amount',
            data: areaChart.value.series.length > 0 ? areaChart.value.series[0].data : []
        }
    ],
    colors: ['#fff'],
    grid: {
        show: false,
        padding: {
            left: 0,
            right: 0
        }
    },
    chart: {
        toolbar: {
            show: false
        },
        sparkline: {
            enabled: true
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 3,
        colors: 'rgba(255, 255, 255, 0.5)'
    },
    tooltip: {
        theme: 'dark'
    }
}));

const areaChart = ref<{
    series: Array<{ name: string; data: number[] }>;
    categories: string[];
}>({
    series: [],
    categories: []
});

const fetchMonthlyContractData = async (year: number) => {
    try {
        const response = await api.get(`/contract/chart/total/monthly?year=${year}`);
        const data = response.data.result;

        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        const totalAmounts = allMonths.map((month) => data[month] || 0);

        areaChart.value.categories = allMonths;
        areaChart.value.series = [{ name: 'Contract Total', data: totalAmounts }];

        totalContractAmount.value = totalAmounts.reduce((acc, amount) => acc + amount, 0);
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    fetchMonthlyContractData(new Date().getFullYear());
    setTimeout(() => (elementVisible.value = true), 10);
});
</script>

<template>
    <VCard elevation="10" class="overflow-hidden">
        <v-card-text class="bg-primary">
            <div class="d-flex align-center">
                <v-icon size="40">mdi-cash-multiple</v-icon>
                <div class="mx-4">
                    <h3 class="text-h4 font-weight-bold">총 계약 금액</h3>

                    <div class="mt-1 text-h6 font-weight">{{ new Date().getFullYear() }}년</div>
                </div>
            </div>
            <v-row class="mt-4">
                <v-col cols="4" class="d-flex align-center">
                    <h2 class="font-weight-light white--text text-nowrap" style="font-size: 1.5rem">
                        {{ totalContractAmount.toLocaleString() }} 원
                    </h2>
                </v-col>
                <v-col cols="7">
                    <div class="float-right" v-show="elementVisible">
                        <apexchart
                            type="line"
                            height="70px"
                            width="500px"
                            :options="chartOptions"
                            :series="chartOptions.series"
                        ></apexchart>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </VCard>
</template>
