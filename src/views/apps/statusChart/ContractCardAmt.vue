<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axiosinterceptor';

interface ContractData {
    [key: string]: number;
}

const selectedYear = ref<number>(new Date().getFullYear());

const contractCount = ref(0);
const contractSeries = ref<number[]>([]);

const chartOptions = computed(() => ({
    series: [{ name: '계약 개수', data: contractSeries.value }],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '20%',
            borderRadius: 4
        }
    },
    grid: {
        show: false,
        padding: { left: 0, right: 0 }
    },
    colors: ['rgba(255, 255, 255, 0.5)'],
    chart: {
        toolbar: { show: false },
        sparkline: { enabled: true }
    },
    dataLabels: {
        enabled: false
    },
    tooltip: {
        theme: 'dark',
        y: {
            formatter: (val: any) => `${val} 건`
        }
    }
}));

const fetchContractData = async (year: number) => {
    try {
        const response = await api.get(`/contract/chart/count/monthly?year=${year}`);
        const data: ContractData = response.data.result;

        if (data && typeof data === 'object') {
            const monthlyData = Array(12).fill(0);
            let totalCount = 0;
            for (const [key, count] of Object.entries(data)) {
                const month = parseInt(key.split('-')[1]) - 1;
                monthlyData[month] = count;
                totalCount += count;
            }
            contractSeries.value = monthlyData;
            contractCount.value = totalCount;
        } else {
            contractSeries.value = Array(12).fill(0);
            contractCount.value = 0;
        }
    } catch (error) {
        console.error('Failed to fetch contract data:', error);
        contractSeries.value = Array(12).fill(0);
        contractCount.value = 0;
    }
};

onMounted(() => fetchContractData(new Date().getFullYear()));

const formattedContractCount = computed(() => {
    return contractCount.value.toLocaleString() + ' 건';
});
</script>

<template>
    <VCard elevation="10" class="overflow-hidden">
        <v-card-text class="bg-secondary">
            <div class="d-flex align-center">
                <v-icon size="40">mdi-chart-bar</v-icon>
                <div class="mx-4">
                    <h3 class="text-h4 font-weight-bold">총 계약 건수</h3>

                    <div class="mt-1 text-h6 font-weight">{{ new Date().getFullYear() }}년</div>
                </div>
            </div>
            <v-row class="mt-4">
                <v-col cols="4" class="d-flex align-center">
                    <h2 class="font-weight-light white--text text-nowrap" style="font-size: 1.5rem">{{ formattedContractCount }}</h2>
                </v-col>
                <v-col cols="7">
                    <div class="ml-auto">
                        <apexchart type="bar" height="70px" :options="chartOptions" :series="chartOptions.series"></apexchart>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </VCard>
</template>
