<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import api from '@/api/axiosinterceptor';

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);

// Generate options for the last 10 years
for (let i = selectedYear.value - 9; i <= selectedYear.value; i++) {
    yearOptions.value.push(i);
}

const areaChart = ref<{
    series: Array<{ name: string; data: number[] }>;
    categories: string[];
}>({
    series: [],
    categories: []
});

const chartOptions = computed(() => ({
    chart: {
        type: 'area',
        height: 400,
        fontFamily: `inherit`,
        foreColor: '#adb0bb',
        zoom: {
            enabled: true
        },
        toolbar: {
            show: false
        }
    },
    colors: [getPrimary.value, getSecondary.value],
    dataLabels: {
        enabled: false
    },
    stroke: {
        width: 3,
        curve: 'smooth'
    },
    xaxis: {
        type: 'datetime',
        categories: areaChart.value.categories,
        tickAmount: 12, // Show 12 labels
        labels: {
            format: 'M월' // Format for month labels
        },
        endOnTick: true
    },
    yaxis: {
        opposite: false,
        labels: {
            formatter: (value: number) => {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Format with commas
            },
            show: true
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        width: '50px'
    },
    grid: {
        show: false
    },
    tooltip: {
        theme: 'light',
        x: {
            formatter: (value: string) => {
                return new Date(value).toLocaleString('ko-KR', { month: 'short' });
            }
        },
        y: {
            formatter: (value: number) => {
                return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`; // Format with commas and add 원
            }
        }
    }
}));

const fetchMonthlyContractData = async (year: number) => {
    try {
        const response = await api.get(`/contract/chart/total/monthly?year=${year}`);

        console.log(response);
        const data = response.data.result;
        if (!data || typeof data !== 'object') {
            console.error('No data available', data);
            return;
        }

        // Create an array of months for the selected year
        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);

        // Map response data to months, defaulting to 0 if no data exists
        const totalAmounts = allMonths.map((month) => data[month] || 0);

        // Update chart data
        areaChart.value.categories = allMonths;
        areaChart.value.series = [{ name: '계약 총액', data: totalAmounts }];
    } catch (error) {
        console.error(error);
    }
};

// Call API when the selected year changes
const onYearChange = () => {
    console.log('Selected year:', selectedYear.value);
    fetchMonthlyContractData(selectedYear.value);
};

// Fetch data on component mount
onMounted(() => {
    fetchMonthlyContractData(selectedYear.value);
});
</script>

<template>
    <v-row>
        <v-col cols="12" md="4">
            <v-select v-model="selectedYear" :items="yearOptions" label="년도 선택" @update:model-value="onYearChange" />
        </v-col>
    </v-row>
    <apexchart type="area" height="300" :options="chartOptions" :series="areaChart.series" />
</template>
