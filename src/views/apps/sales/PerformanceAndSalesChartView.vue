<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPrimary, getSecondary, getLightPrimary } from '@/utils/UpdateColors';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import api from '@/api/axiosinterceptor';

const page = ref({ title: '차트' });
const breadcrumbs = ref([
    {
        text: '차트',
        disabled: false,
        href: '#'
    },
    {
        text: '실적 매출 차트',
        disabled: true,
        href: '#'
    }
]);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

const yearSales = ref(0);
const monthSales = ref(0);
const yearTargetSales = ref(0);
const monthTargetSales = ref(0);

const monthAttainment = ref(0);
const yearAttainment = ref(0);

function formatNumberWithCommas(value) {
    if (value === null || value === undefined) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



const fetchSalesData = async (year: number, month: number) => {
    try {
        let url =`/sales/count/monthly?year=${year}`;

        console.log(url);
        const response = await api.get(url);
        const data = response.data.result || {};

        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        const salesData = allMonths.map(month => data[month] || 0);

        // console.log(salesData);

        for(var i = 0; i < 12; i++){
            yearSales.value += salesData[i];

            if(i+1 == month){
                monthSales.value = salesData[i];
            }
        }

        // console.log(monthSales);
        // console.log(yearSales);
        

    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }

};

const fetchTargetSalesData = async (year: number, month: number) => {
    try {
        let url = `/admin/targetsales/status/monthly?year=${year}`; 

        const response = await api.get(url);
        const data = response.data.result || {};
        const allMonths = Array.from({ length: 12 }, (_, i) => String(i + 1));
        const targetSalesData = allMonths.map(month => data[month] || 0);

        // console.log(targetSalesData);

        for(var i = 0; i < 12; i++){
            yearTargetSales.value += targetSalesData[i];

            if(i+1 == month){
                monthTargetSales.value = targetSalesData[i];
            }
        }

        monthAttainment.value = monthTargetSales.value ? (monthSales.value / monthTargetSales.value) * 100 : 0;
        yearAttainment.value = yearTargetSales.value ? (yearSales.value / yearTargetSales.value) * 100 : 0;

    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};


const monthChartOptions = computed(() => {
    return {
        labels: ['달성률', '당월 매출'],
        chart: {
            height: 275,
            type: 'donut',
            foreColor: '#adb0bb',
            fontFamily: `inherit`,
            toolbar: {
                show: false
            }
        },
        colors: [getPrimary.value, getLightPrimary.value],
        plotOptions: {
            pie: {
                donut: {
                    size: '89%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: 7,
                            fontSize: '18px',
                            fontWeight: 'bold'
                        },
                        value: {
                            show: false
                        },
                        total: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: '600',
                            label: formatNumberWithCommas(monthSales.value),
                            color: '#333'
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: false
        },
        legend: {
            show: false
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return `${val.toFixed(2)}%`;
                }
            }
        }
    };
});

const yearChartOptions = computed(() => {
    return {
        labels: ['달성률', '올 해 매출'],
        chart: {
            height: 275,
            type: 'donut',
            foreColor: '#adb0bb',
            fontFamily: `inherit`,
            toolbar: {
                show: false
            }
        },
        colors: [getPrimary.value, getLightPrimary.value],
        plotOptions: {
            pie: {
                donut: {
                    size: '89%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: 7,
                            fontSize: '18px',
                            fontWeight: 'bold'
                        },
                        value: {
                            show: false
                        },
                        total: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: '600',
                            label: formatNumberWithCommas(yearSales.value),
                            color: '#333'
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: false
        },
        legend: {
            show: false
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return `${val.toFixed(2)}%`;
                }
            }
        }
    };
});


const monthSeries = computed(() => [100 - monthAttainment.value ,monthAttainment.value]);
const yearSeries = computed(() => [100 - yearAttainment.value, yearAttainment.value]);



onMounted(() => {
    fetchSalesData(year, month);
    fetchTargetSalesData(year, month);
});

</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

    <v-row>
        <v-col cols="6">
            <v-card elevation="10" class="overflow-hidden">
                <v-card-item class='py-4 px-6 text-white bg-info'>
                    <h4 class="text-h6" style = "font-weight: bold;">{{ year }} 년 {{ month }}월</h4>
                </v-card-item>
                <v-table>
                    <thead>
                        <tr>
                            <th class="text-h6" style = "font-weight: bold;">목표</th>
                            <th class="text-h6" style = "font-weight: bold;">실적</th>
                            <th class="text-h6" style = "font-weight: bold;">달성</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ formatNumberWithCommas(monthTargetSales) }}</td>
                            <td>{{ formatNumberWithCommas(monthSales) }}</td>
                            <td>{{ (monthTargetSales ? (monthSales / monthTargetSales) * 100 : 0).toFixed(2) }}%</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
        </v-col>

        <v-col cols="6">
            <v-card elevation="10" class="overflow-hidden">
                <v-card-item class='py-4 px-6 text-white bg-info'>
                    <h4 class="text-h6" style = "font-weight: bold;">{{ year }} 년</h4>
                </v-card-item>
                <v-table>
                    <thead>
                        <tr>
                            <th class="text-h6" style = "font-weight: bold;">목표</th>
                            <th class="text-h6" style = "font-weight: bold;">실적</th>
                            <th class="text-h6" style = "font-weight: bold;">달성</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ formatNumberWithCommas(yearTargetSales) }}</td>
                            <td>{{ formatNumberWithCommas(yearSales) }}</td>
                            <td>{{ (yearTargetSales ? (yearSales / yearTargetSales) * 100 : 0).toFixed(2) }}%</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
        </v-col>
    </v-row>

    <v-row>
        <v-col cols="6">
            <v-card elevation="10" >
                <v-card-item>
                    <v-card-title class="text-h5">당월</v-card-title>
                    <apexchart class="mt-6" type="donut" height="275" :options="monthChartOptions" :series="monthSeries"> </apexchart>
                    
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="6">
            <v-card elevation="10" >
                <v-card-item>
                    <v-card-title class="text-h5">년</v-card-title>
                    <apexchart class="mt-6" type="donut" height="275" :options="yearChartOptions" :series="yearSeries"> </apexchart>
                    
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>


</template>

<style>
    .v-card{
        margin-bottom: 2rem;
    }
</style>
