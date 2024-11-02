<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import { TicketIcon, ReceiptIcon, MoneybagIcon, ChartLineIcon } from 'vue-tabler-icons';

const props = defineProps({
    monthData: {
        type: [Object, Function],
        default: () => ({})
    }
});

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const chartData = reactive({
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

const leadCount = ref(0);
const sales = ref(0);
const profit = ref(0);
const margin = ref(0);

watch(
    () => props.monthData,
    (newMonthData) => {
        leadCount.value = newMonthData.totalLeadCount;
        sales.value = newMonthData.totalSales;
        profit.value = newMonthData.totalProfit;
        margin.value = parseFloat(((profit.value / sales.value) * 100).toFixed(2));
        chartData.series[0].data = newMonthData.monthExpSales;
        chartData.series[1].data = newMonthData.monthExpProfit;
        chartData.series[2].data = newMonthData.monthLeadCount;
    }
);

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
        categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
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
    <v-row>
        <v-col cols="12" lg="3">
            <v-card class="bg-primary" elevation="10">
                <v-card-text class="pa-6">
                    <component :is="TicketIcon" stroke-width="1.5" size="25" />
                    <h5 class="text-h5 mt-2 text-white">전체</h5>
                    <span class="text-white">{{ leadCount }} 건</span>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" lg="3">
            <v-card class="second" elevation="10">
                <v-card-text class="pa-6">
                    <component class="text-white" :is="ReceiptIcon" stroke-width="1.5" size="25" />
                    <h5 class="text-h5 mt-2 text-white">예상매출금액</h5>
                    <span class="text-white">{{ formatNumber(sales) }} 천원</span>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" lg="3">
            <v-card class="bg-secondary" elevation="10">
                <v-card-text class="pa-6">
                    <component :is="MoneybagIcon" stroke-width="1.5" size="25" />
                    <h5 class="text-h5 mt-2 text-white">예상이익금액</h5>
                    <span class="text-white">{{ formatNumber(profit) }} 천원</span>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" lg="3">
            <v-card class="bg-success" elevation="10">
                <v-card-text class="pa-6">
                    <component :is="ChartLineIcon" stroke-width="1.5" size="25" />
                    <h5 class="text-white text-h5 mt-2">예상이익률</h5>
                    <span class="text-white">{{ margin }} %</span>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
    <VCardSubtitle class="subtitle my-3">단위 : (건/천원)</VCardSubtitle>
    <apexchart type="line" height="400" :options="chartOptions" :series="chartData.series"> </apexchart>
</template>

<style lang="scss" scoped>
.subtitle {
    text-align: right;
}

.second {
    background-color: #008dc9;
}
</style>
