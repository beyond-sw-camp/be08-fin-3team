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
        href: 'sales status chart'
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
        width: 3,
        curve: 'smooth'
    },
    xaxis: {
        type: 'datetime',
        categories: areaChart.value.categories,
        tickAmount: 12, 
        labels: {
            format: 'M월'
        },
        endOnTick: false, 
    },
    yaxis: {
        opposite: false,
        min: 0,
        max: 5000000,
        labels: {
            formatter: (value: number) => value.toFixed(0),
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
            formatter: (value: number) => `${value}건`
        }
    }
}));


const fetchMonthlySalesData = async (year: number) => {
    try {
        const response = await api.get(`/sales/count/monthly?year=${year}`);
        console.log('API 응답 데이터:', response.data);

        const data = response.data.result || {};

        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        
        const salesData = allMonths.map(month => data[month] || 0);

        areaChart.value.categories = allMonths;
        areaChart.value.series = [{ name: '매출액', data: salesData }];
        
        console.log('카테고리:', areaChart.value.categories); // 확인용
        console.log('판매 데이터:', salesData); // 확인용
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const onYearChange = () => {
    fetchMonthlySalesData(selectedYear.value);
};

onMounted(() => {
    fetchMonthlySalesData(selectedYear.value);
});
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
                <apexchart type="area" height="300" :options="chartOptions" :series="areaChart.series"></apexchart>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
