<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { getPrimary, getSecondary } from '@/utils/UpdateColors';
import api from '@/api/axiosinterceptor';
import { categoryMapping } from '@/utils/ActStatusMappings'; 

const page = ref({ title: 'Column Chart' });

const theme = useTheme();
const chartOptions = ref({
    chart: {
        type: 'bar',
        height: 350,
        fontFamily: `inherit`,
        foreColor: '#a1aab2',
        toolbar: {
            show: false,
        },
    },
    // colors: ['rgba(var(--v-theme-error))', getPrimary.value, getSecondary.value],
    colors: ['#4CC5DB', '#44BFD6', getPrimary.value, getSecondary.value],

    dataLabels: {
      enabled: true,
      formatter: (val: any) => `${val} 건`,
      offsetY: -10,
      style: {
          colors: ['#6b864a']
      }
    },
    plotOptions: {
    bar: {
        horizontal: false,
        endingShape: 'rounded',
        columnWidth: '20%',
        borderRadius: 4, // 막대에 모서리
      }
    },
    xaxis: {
        categories: [] as string[], // 카테고리의 타입을 string[]로 명시
        style: {
            fontSize: '100%',
            fontWeight: 'bold',
        }
    },
    yaxis: {
      title: {
          text: '활동 수',
          style: {
              fontSize: '100%',
              fontWeight: 'bold',
          }
      }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        theme: 'light',
        y: {
            formatter(val: any) {
                return `${val} 건`;
            },
        },
    },
    grid: {
    show: true,
    borderColor: '#e7e7e7',
    strokeDashArray: 8, // 점선 형태의 그리드
    },
    legend: {
        show: true,
        position: 'bottom',
        width: '80px',
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
});

// 차트 데이터 초기화
const columnChart = ref({
  series: [
      {
          name: '분류 개수',
          data: [] as number[]
      }
  ]
});

const fetchCategoryData = async () => {
    try {
        const response = await api.get('/acts/chart/count/category');
        const data = response.data.result;
        console.log('막대', response)

        // 시리즈 데이터 생성
        columnChart.value.series[0].data = Object.values(data) as number[];
        // X축 카테고리 설정(한글 매핑)
        // 키 배열로 반환
        // [key as keyof typeof categoryMapping]: key를 categoryMapping의 키 중 하나로 인식 타입 오류 방지
        // || key로 매핑 없는 경우 key 그대로 반환
        const categories = Object.keys(data).map(
            (key) => categoryMapping[key as keyof typeof categoryMapping] || key
        ) as string[];

        // console.log('categories:', categories);
        chartOptions.value.xaxis.categories = categories;

        chartOptions.value = {
          ...chartOptions.value,
          xaxis: {
              ...chartOptions.value.xaxis,
              categories: categories
          }
      };


    } catch (error) {
        console.error(error);
    }
};

// 컴포넌트 마운트 시 데이터 호출
onMounted(() => {
    fetchCategoryData();
});
</script>

<template>
  <apexchart
      id="column-chart"
      type="bar"
      height="300"
      :options="chartOptions"
      :series="columnChart.series"
  ></apexchart>
</template>
