<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTheme } from 'vuetify';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import api from '@/api/axiosinterceptor';

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);

for (let i = selectedYear.value - 9; i <= selectedYear.value; i++) {
    yearOptions.value.push(i);
}

const theme = useTheme();
const primaryColor = computed(() => theme.global.current.value.colors.primary);
const secondaryColor = computed(() => theme.global.current.value.colors.secondary);

const columnChart = ref({
    series: [{ name: '계약 개수', data: [] as number[] }]
});

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const chartOptions = ref({
    chart: {
        type: 'bar',
        height: 350,
        fontFamily: `inherit`,
        foreColor: '#a1aab2',
        toolbar: { show: false }
    },
    colors: [primaryColor.value, secondaryColor.value],
    dataLabels: {
        enabled: true,
        formatter: (val: any) => `${val} 건`,
        offsetY: -10,
        style: { colors: ['#FFFFFF'] }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            endingShape: 'rounded',
            columnWidth: '20%',
            borderRadius: 4
        }
    },
    xaxis: {
        categories: monthNames,
        style: {
            fontSize: '100%',
            fontWeight: 'bold'
        }
    },
    yaxis: {
        title: {
            text: '계약 개수',
            style: {
                fontSize: '100%',
                fontWeight: 'bold'
            }
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        theme: 'light',
        y: {
            formatter(val: any) {
                return `${val} 건`;
            }
        }
    },
    grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 8
    },
    legend: {
        show: true,
        position: 'bottom',
        width: '80px'
    },
    responsive: [
        {
            breakpoint: 600,
            options: {
                yaxis: { show: false }
            }
        }
    ]
});

const fetchContractData = async (year: number) => {
    try {
        const response = await api.get(`/contract/chart/count/monthly?year=${year}`);
        const data = response.data.result;

        if (data && typeof data === 'object') {
            const monthlyData = Array(12).fill(0);
            for (const [key, count] of Object.entries(data)) {
                const month = parseInt(key.split('-')[1]) - 1;
                monthlyData[month] = count;
            }
            columnChart.value.series[0].data = monthlyData;
        } else {
            columnChart.value.series[0].data = Array(12).fill(0);
            console.warn('No data available for the selected year');
        }
    } catch (error) {
        console.error('Failed to fetch contract data:', error);
        columnChart.value.series[0].data = Array(12).fill(0);
    }
};

const onYearChange = () => {
    fetchContractData(selectedYear.value);
};

onMounted(() => {
    fetchContractData(selectedYear.value);
});
</script>

<template>
    <v-row>
        <v-col cols="12" md="4">
            <v-select v-model="selectedYear" :items="yearOptions" label="년도 선택" @change="onYearChange" />
        </v-col>
    </v-row>
    <apexchart id="column-chart" type="bar" height="300" :options="chartOptions" :series="columnChart.series" />
</template>
