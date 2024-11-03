<script setup>
import { computed, watch, reactive } from 'vue';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';

const props = defineProps({
    pathData: {
        type: [Object, Function],
        default: () => ({})
    }
});

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const chartData = reactive({
    labels: [],
    series: [
        {
            name: '예상계약금액',
            type: 'column',
            data: []
        },
        {
            name: '예상이익금액',
            type: 'column',
            data: []
        },
        {
            name: '건',
            type: 'line',
            data: []
        }
    ]
});

watch(
    () => props.pathData,
    (newData) => {
        chartData.labels = newData.map((item) => getPathName(item.awarePath));
        chartData.series[0].data = newData.map((item) => item.totalExpSales);
        chartData.series[1].data = newData.map((item) => item.totalExpProfit);
        chartData.series[2].data = newData.map((item) => item.leadCount);
    }
);

const getPathName = (path) => {
    const pathNames = {
        EXISTING: '기존고객',
        ETC: '기타',
        DEMO: '데모체험',
        NEWSPAPER: '신문',
        SEARCH: '인터넷검색',
        EDUCATION: '정규교육',
        INTRODUCE: '지인소개',
        PARTNER: '파트너사'
    };
    return pathNames[path] || '';
};

const chartOptions = computed(() => ({
    chart: {
        type: 'line',
        height: 350,
        stacked: false,
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false
            }
        }
    },
    colors: [getPrimary.value, getSecondary.value, 'gray'],
    dataLabels: {
        enabled: true,
        enabledOnSeries: [2]
    },
    stroke: {
        width: [2, 2, 4],
        curve: 'smooth'
    },
    xaxis: {
        categories: chartData.labels
    },
    yaxis: [
        {
            seriesName: '예상계약금액',
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: getPrimary.value
            },
            labels: {
                formatter: (val) => `${formatNumber(val)}`,
                style: {
                    colors: getPrimary.value
                }
            },
            tooltip: {
                enabled: true
            }
        },
        {
            seriesName: '예상이익금액',
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: getSecondary.value
            },
            labels: {
                formatter: (val) => `${formatNumber(val)}`,
                style: {
                    colors: getSecondary.value
                }
            }
        },
        {
            show: false,
            seriesName: '건',
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: '#FEB019'
            },
            labels: {
                formatter: (val) => `${Math.floor(val)}`,
                style: {
                    colors: '#FEB019'
                }
            }
        }
    ],
    tooltip: {
        fixed: {
            enabled: true,
            position: 'topLeft',
            offsetY: 30,
            offsetX: 60
        }
    },
    legend: {
        position: 'bottom'
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
}));
</script>

<template>
    <VCardSubtitle class="subtitle">단위 : (건/천원)</VCardSubtitle>
    <apexchart type="line" height="300" :options="chartOptions" :series="chartData.series"></apexchart>
</template>

<style lang="scss" scoped>
.subtitle {
    text-align: right;
}
</style>
