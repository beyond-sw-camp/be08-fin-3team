<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import api from '@/api/axiosinterceptor';

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);

// 최근  10년치 옵션 생성
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
        type: 'datetime',
        categories: areaChart.value.categories, 
        tickAmount: 12, // 12개의 레이블을 표시하도록 설정
        labels: {
          format: 'M월'
        },
        endOnTick: true
    },
    yaxis: {
        opposite: false,
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
    const response = await api.get(`/acts/chart/count/monthly?year=${year}`);

    console.log(response)
    const data = response.data.result;
    if (!data || typeof data !== 'object') {
      console.error('데이터 없음', data);
      return;
    }
    // 값이 없더라도 1~12월 모두 표시되게
    // 길이 12인 배열 생성 후 배열 요소 접근 및 인덱스를 받음
    // 화살표 함수로 year값에 월값(ex. 2024-01)연결, 문자열의 길이를 2자리로 맞추고 1월인 경우는 01로 표현되도록
    const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);

    // 응답 데이터를 사용해 각 월의 값 매핑, 값이 없으면 0으로 설정
    const salesData = allMonths.map(month => data[month] || 0);

    // 차트 데이터 업데이트
    areaChart.value.categories = allMonths;
    areaChart.value.series = [
      { name: '활동 수', data: salesData }
    ];
  } catch (error) {
    console.error(error);
  }
};


// 사용자가 년도를 변경할 때 API 호출
const onYearChange = () => {
  console.log('Selected year:', selectedYear.value);
    fetchMonthlySalesData(selectedYear.value);
};

onMounted(() => {
    fetchMonthlySalesData(selectedYear.value);
});
</script>

<template>
  <v-row>
      <v-col cols="12" md="4">
          <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="년도 선택"
              @update:model-value="onYearChange"
          />
      </v-col>
  </v-row>
        <apexchart
            type="area"
            height="300"
            :options="chartOptions"
            :series="areaChart.series"
        />
</template>
