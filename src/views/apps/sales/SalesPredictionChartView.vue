<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

interface SalesPredictionDto {
    predictedPrice: number;
    predictedTime: string;
    predictGrowRate: number;
}

const breadcrumbs = ref([
    {
        text: '매출 Chart',
        disabled: false,
        href: '../../sales'
    },
    {
        text: '매출 예측 Chart',
        disabled: true,
        href: '#'
    }
]);

const page = ref({ title: '차트' });
const monthlyChartData = ref<{ series: Array<{ name: string; data: number[] }> }>({
    series: []
});
const quarterlyChartData = ref<{ series: Array<{ name: string; data: number[] }> }>({
    series: []
});
const monthlyResponseBody = ref<any>(null);
const quarterlyResponseBody = ref<any>(null);

const fetchMonthlySalesPredictions = async () => {
    try {
        const response = await api.get('/testsales/forecast/month');
        if (response.data.isSuccess) {
            monthlyResponseBody.value = response.data.result;
            updateMonthlyChartData();
        } else {
            console.error('API 요청 실패:', response.data.message);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const fetchQuarterlySalesPredictions = async () => {
    try {
        const response = await api.get('/testsales/forecast/quarter');
        if (response.data.isSuccess) {
            quarterlyResponseBody.value = response.data.result;
            updateQuarterlyChartData();
        } else {
            console.error('API 요청 실패:', response.data.message);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const convertPredictionResponseToDto = (data: any): SalesPredictionDto[] => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("유효한 데이터가 없습니다.");
    }

    const predictions: SalesPredictionDto[] = [];
    
    for (let item of data) {
        const dto: SalesPredictionDto = {
            predictedPrice: item.predictedPrice,
            predictedTime: item.predictedTime,
            predictGrowRate: item.predictGrowRate,
        };
        predictions.push(dto);
    }
    return predictions;
};

const updateMonthlyChartData = () => {
    if (!monthlyResponseBody.value) return;

    const data = convertPredictionResponseToDto(monthlyResponseBody.value);

    const month = new Date().getMonth() + 1;
    const isFirstHalf = month <= 6;

    const filteredData = isFirstHalf 
        ? data.filter(item => parseInt(item.predictedTime.split('-')[1]) <= 6)
        : data.filter(item => parseInt(item.predictedTime.split('-')[1]) >= 7);

    const seriesName = isFirstHalf ? '전반기 판매 예측' : '하반기 판매 예측';

    monthlyChartData.value.series = [
        {
            name: seriesName,
            data: filteredData.map(item => item.predictedPrice)
        },
    ];
};

const updateQuarterlyChartData = () => {
    if (!quarterlyResponseBody.value) return;

    const data = convertPredictionResponseToDto(quarterlyResponseBody.value);

    quarterlyChartData.value.series = [
        {
            name: '분기별 판매 예측',
            data: data.map(item => item.predictedPrice)
        },
    ];
};

onMounted(() => {
    fetchMonthlySalesPredictions();
    fetchQuarterlySalesPredictions();
});

const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const monthlyChartOptions = computed(() => {
    return {
        chart: {
            type: 'area',
            height: 300,
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
            width: '3',
            curve: 'smooth'
        },
        xaxis: {
            type: 'category',
            categories: monthlyResponseBody.value ? monthlyResponseBody.value.map((item: { predictedTime: any; }) => {
                return item.predictedTime; 
            }) : [],
            labels: {
                formatter: (value: string) => value 
            }
        },
        yaxis: {
            opposite: false,
            labels: {
                show: true,
                formatter: (value: number) => `${formatCurrency(value)} 원`
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
            theme: 'dark',
            y: {
                formatter: (value: number) => formatCurrency(value)
            }
        }
    };
});

const quarterlyChartOptions = computed(() => {
    return {
        chart: {
            type: 'area',
            height: 300,
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
            width: '3',
            curve: 'smooth'
        },
        xaxis: {
            type: 'category',
            categories: quarterlyResponseBody.value ? quarterlyResponseBody.value.map((item: { predictedTime: any; }) => item.predictedTime) : []
        },
        yaxis: {
            opposite: false,
            labels: {
                show: true,
                formatter: (value: number) => `${formatCurrency(value)} 원`
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
            theme: 'dark',
            y: {
                formatter: (value: number) => formatCurrency(value)
            }
        }
    };
});

const getMonthlyChartTitle = computed(() => {
    const month = new Date().getMonth() + 1; 
    const year = new Date().getFullYear();
    return `${year + 1}년 ${month <= 6 ? '하반기' : '전반기'} 매출 예측 차트`;
});

const getQuarterlyChartTitle = computed(() => {
    const year = new Date().getFullYear();
    return `${year + 1}년 분기별 매출 예측 차트`;
});
</script>

<template>
    <v-row>
        <v-col cols="12">
            <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
            <UiParentCard :title="getMonthlyChartTitle">
                <apexchart type="area" height="300" :options="monthlyChartOptions" :series="monthlyChartData.series"></apexchart>
            </UiParentCard>
        </v-col>
        <v-col cols="12">
            <UiParentCard :title="getQuarterlyChartTitle">
                <apexchart type="area" height="300" :options="quarterlyChartOptions" :series="quarterlyChartData.series"></apexchart>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
