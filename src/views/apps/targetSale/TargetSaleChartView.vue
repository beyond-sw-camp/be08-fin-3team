<script setup lang="ts">
import { ref, computed, onMounted  } from 'vue';
import { useTheme } from 'vuetify';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

const page = ref({ title: '차트' });
const breadcrumbs = ref([
    {
        text: '매출 차트',
        disabled: false,
        href: '#'
    },
    {
        text: '목표 매출 차트',
        disabled: true,
        href: '#'
    }
]);

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);


for (let i = selectedYear.value - 9; i <= selectedYear.value; i++) {
    yearOptions.value.push(i);
}

const theme = useTheme();
const chartOptions = computed(() => {
    return {
        chart: {
            type: 'bar',
            height: 350,
            fontFamily: `inherit`,
            foreColor: '#a1aab2',
            toolbar: {
                show: false,
            },
        },
        colors: ['rgba(var(--v-theme-error))', getPrimary.value, getSecondary.value],
        plotOptions: {
            bar: {
                horizontal: false,
                endingShape: 'rounded',
                columnWidth: '20%'
            }
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },

        xaxis: {
            categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
        },
        yaxis: {
            title: {
                text: '',
            },
        },
        fill: {
            opacity: 1
        },

        tooltip: {
            theme: 'dark',
            y: {
                formatter(val:any) {
                    return `$ ${val} thousands`;
                },
            },
        },
        grid: {
            show: false,
        },
        legend: {
            show: true,
            position: 'bottom',
            width: '50px',
        },
        responsive: [
            {
                breakpoint: 600,
                options: {
                    yaxis: {
                        show: false
                    }
                }
            }
        ]
    };
});

const columnChart = ref({
    series: [
        {
            name: '목표 매출',
            data: Array(12).fill(0)
        },
        {
            name: '매출',
            data: Array(12).fill(0)
        },
    ]
});

const fetchMonthlySalesData = async (year: number) => {
    try {
        const response = await api.get(`/sales/count/monthly?year=${year}`);
        const data = response.data.result || {};

        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        const salesData = allMonths.map(month => data[month] || 0);

        const salesSeries = columnChart.value.series.find(series => series.name === '매출');
        
        if (salesSeries) {
            salesSeries.data = salesData;
        }

    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const fetchMonthlyTargetSalesData = async(year: number) => {
    try{
        const response = await api.get(`/admin/targetsales/status/monthly?year=${year}`)

        console.log(response.data.result);

        const data = response.data.result || {};

        const allMonths = Array.from({ length: 12 }, (_, i) => String(i + 1));
        const targetSalesData = allMonths.map(month => data[month] || 0);

        const targetSalesSeries = columnChart.value.series.find(series => series.name === '목표 매출');

        if (targetSalesSeries) {
            targetSalesSeries.data = targetSalesData;
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};


const onYearChange = () => {
    fetchMonthlySalesData(selectedYear.value);
    fetchMonthlyTargetSalesData(selectedYear.value);
};

onMounted(() => {
    fetchMonthlySalesData(selectedYear.value);
    fetchMonthlyTargetSalesData(selectedYear.value);
});


</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="월별 목표 매출 차트">
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
                <apexchart type="bar" height="300" :options="chartOptions" :series="columnChart.series"> </apexchart>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
