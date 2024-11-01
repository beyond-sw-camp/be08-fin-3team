<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import api from '@/api/axiosinterceptor';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);

const breadcrumbs = ref([
    {
        text: '매출 차트',
        disabled: false,
        href: '../../sales'
    },
    {
        text: '매출 현황 차트',
        disabled: true,
        href: '#'
    }
]);
const page = ref({ title: '차트' });

for (let i = selectedYear.value - 9; i <= selectedYear.value; i++) {
    yearOptions.value.push(i);
}

const areaChart = ref<{
    series: { name: string; data: number[]; color?: string }[];
    categories: string[];
}>({
    series: [],
    categories: []
});

// 최대값 계산 및 yaxis 설정을 위한 함수
const calculateMaxYValue = (currentData: number[], previousData: number[]) => {
    const maxCurrent = Math.max(...currentData);
    const maxPrevious = Math.max(...previousData);
    const overallMax = Math.max(maxCurrent, maxPrevious);
    return Math.ceil(overallMax / 1000000) * 1000000; 
};

const chartOptions = computed(() => {
    const currentSalesData = areaChart.value.series.length > 0 ? areaChart.value.series[0].data : [];
    const previousSalesData = areaChart.value.series.length > 1 ? areaChart.value.series[1].data : [];
    const maxYValue = calculateMaxYValue(currentSalesData, previousSalesData);

    return {
        chart: {
            type: 'area',
            height: 400,
            fontFamily: 'inherit',
            foreColor: '#adb0bb',
            zoom: {
                enabled: true 
            },
            toolbar: {
                show: false
            }
        },
        colors: ['#5A67D8', '#A0AEC0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            width: [3, 2],
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
            categories: areaChart.value.categories,
            tickAmount: 12, 
            labels: {
                format: 'yyyy-MM'
            },
            endOnTick: false, 
        },
        yaxis: {
            opposite: false,
            min: 0,
            max: maxYValue, 
            tickAmount: 6,
            labels: {
                formatter: (value: number) => {
                    const roundedValue = Math.ceil(value / 10000) * 10000; 
                    return `${roundedValue.toLocaleString()} 원`; 
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
                    return new Date(value).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit' });
                }
            },
            y: {
                formatter: (value: number) => `${value.toLocaleString('ko-KR')} ₩`
            }
        },
    };
});

const fetchMonthlySalesData = async (year: number) => {
    try {
        const response = await api.get(`/sales/count/monthly?year=${year}`);
        const data = response.data.result || {};
        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        const currentSalesData = allMonths.map(month => data[month] || 0);

        areaChart.value.categories = allMonths;
        areaChart.value.series = [{ name: '매출액', data: currentSalesData }];

        // 전년도 데이터 가져오기
        const prevYearResponse = await api.get(`/sales/count/monthly?year=${year - 1}`);
        const prevYearData = prevYearResponse.data.result || {};
        const prevYearMonths = Array.from({ length: 12 }, (_, i) => `${year - 1}-${String(i + 1).padStart(2, '0')}`);
        const previousSalesData = prevYearMonths.map(month => prevYearData[month] || 0);

        areaChart.value.series.push({
            name: '전년도 매출액',
            data: previousSalesData,
            color: '#718096' 
        });

        // y축 최대값 계산
        const maxYValue = calculateMaxYValue(currentSalesData, previousSalesData);
        chartOptions.value.yaxis.max = maxYValue; // 최대값 업데이트

    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const onYearChange = () => {
    fetchMonthlySalesData(selectedYear.value);
};

onMounted(async () => {
    await fetchMonthlySalesData(selectedYear.value);
});

const chartSeries = computed(() => areaChart.value.series);

</script>

<template>
    <v-row>
        <v-col cols="12">
            <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
            <UiParentCard title="월별 매출 차트">
                <v-row>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="selectedYear"
                            :items="yearOptions"
                            label="연도 선택"
                            @update:model-value="onYearChange"
                        />
                    </v-col>
                </v-row>
                <apexchart type="area" height="300" :options="chartOptions" :series="chartSeries"></apexchart>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
