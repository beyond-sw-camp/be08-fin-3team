<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import api from '@/api/axiosinterceptor';

const page = ref({ title: 'Doughnut Chart' });

const theme = useTheme();

const donutchartOptions = computed(() => ({//차트 꾸미기
    chart: {
        type: 'donut',
        height: 300,
        fontFamily: `inherit`,
        foreColor: '#adb0bb'
    },
    dataLabels: {
        enabled: false
    },
    plotOptions: {
        pie: {
            donut: {
                size: '50%'
            }
        }
    },
    stroke: {
        width: 2,
        colors: 'rgba(var(--v-theme-surface))'
    },
    legend: {
        show: true,
        position: 'bottom',
        width: '50px'
    },
    labels: donutChart.value.labels, // 이름 불러오기
    colors: [
        'rgba(var(--v-theme-info))',
        'rgba(var(--v-theme-primary))',
        'rgba(var(--v-theme-error))',
        'rgba(var(--v-theme-success))',
        'rgba(var(--v-theme-warning))'
    ],
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
            }
        }
    ]
}));

const donutChart = ref<{
    series: number[];
    labels: string[];
}>({
    series: [],
    labels: []
});
const fetchActivityRatio = async () => {
    try {
        const response = await api.get('/acts/chart/ratio/user');
        const data = response.data.result; // Assuming the data comes in the format: { userName: percentage }
        console.log(response.data.result)
        
        donutChart.value.labels = Object.keys(data);
        donutChart.value.series = Object.values(data);
    } catch (error) {
        console.error('Error fetching activity ratio:', error);
    }
};

// Fetch data on component mount
onMounted(() => {
    fetchActivityRatio();
});
</script>

<template>
    <v-row>
        <v-col cols="12">
          <!-- Donut Chart -->
              <apexchart
                  type="donut"
                  height="300"
                  :options="donutchartOptions"
                  :series="donutChart.series"
              />
        </v-col>
    </v-row>
</template>
