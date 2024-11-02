<script setup>
import { ref, computed, watch } from 'vue';
import { useTheme } from 'vuetify';

const props = defineProps({
    sucessData: {
        type: [Object, Function],
        default: () => ({})
    }
});

const theme = useTheme();

const pieChart = ref({
    series: []
});

const labels = ref([]);

const piechartOptions = computed(() => {
    return {
        chart: {
            type: 'pie',
            height: 400,
            fontFamily: `inherit`,
            foreColor: '#adb0bb',
            toolbar: {
                show: false
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, { seriesIndex, w }) {
                const label = w.config.labels[seriesIndex];
                return `${val} % (${label})`;
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70px'
                }
            }
        },
        legend: {
            show: true,
            position: 'bottom',
            width: '50px'
        },
        colors: [
            '#00129A',
            '#0023F5',
            'rgba(var(--v-theme-primary))',
            '#3282F6',
            '#9FFCFD',
            'rgba(var(--v-theme-success))',
            'rgba(var(--v-theme-secondary))'
        ],
        tooltip: {
            enabled: false,
            fillSeriesColor: false
        },
        stroke: {
            width: 2,
            colors: 'rgba(var(--v-theme-surface))'
        },
        labels: labels.value, // labels 값을 동적으로 설정
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        ]
    };
});

watch(
    () => props.sucessData,
    (newSuccessData) => {
        labels.value = newSuccessData.map((item) => item.successPer + '%');
        pieChart.value.series = newSuccessData.map((item) => item.count);
    }
);
</script>

<template>
    <v-row>
        <v-col cols="12">
            <apexchart type="pie" height="200" :options="piechartOptions" :series="pieChart.series"> </apexchart>
        </v-col>
    </v-row>
</template>

<style lang="scss" scoped></style>
