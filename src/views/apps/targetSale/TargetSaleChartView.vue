<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
                    return `${val} 원`;
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

const selectedYear = ref<number>(new Date().getFullYear());
const yearOptions = ref<number[]>([]);
const salespersonNames = ref<string[]>([]);
const selectedDepartment = ref<string | null>("전체");
const departmentNames = ref<{ no: number, name: string }[]>([]);
const departmentLabels = ref<string[]>([]);
const selectedSalesperson = ref<string | null>("전체");


for (let i = selectedYear.value - 9; i <= selectedYear.value; i++) {
    yearOptions.value.push(i);
}


async function fetchDepartments() {
    try {
        const response = await api.get('/admin/departments');

        departmentNames.value = treeDepartments(response.data.result);
        departmentLabels.value = departmentNames.value.map(dept => dept.name);
        departmentLabels.value.unshift("전체");
    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

function treeDepartments(departments) {
    const names = [];
    departments.forEach(department => {
        names.push({ no: department.no, name: department.name });
        if (department.children && department.children.length > 0) {
            names.push(...treeDepartments(department.children));
        }
    });
    return names;
}

async function fetchUsersByDepartment(deptNo: number) {
    try {
        const response = await api.get(`/users/by-dept/${deptNo}`);
        salespersonNames.value = response.data.result.map(user => user.name);
        salespersonNames.value.unshift("전체");

    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

const fetchMonthlySalesData = async (year: number, deptName: string | null, salesperson: string | null) => {
    try {
        let url = deptName === "전체"
            ? `/sales/count/monthly?year=${year}`
            : `/sales/status/dept/${deptName}?year=${year}`;
        if (salesperson != "전체") url = `/sales/status/user/${salesperson}?year=${year}`;

        console.log(url);
        const response = await api.get(url);
        const data = response.data.result || {};

        console.log("data : ", data);
        const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
        const salesData = allMonths.map(month => data[month] || 0);

        console.log("sales data : ", salesData);

        const salesSeries = columnChart.value.series.find(series => series.name === '매출');
        if (salesSeries) {
            salesSeries.data = salesData;
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
};

const fetchMonthlyTargetSalesData = async (year: number, deptName: string | null, salesperson: string | null) => {
    try {
        let url = deptName === "전체"
            ?`/admin/targetsales/status/monthly?year=${year}`
            : `/admin/targetsales/dept/${deptName}?year=${year}`; 
        if (salesperson != "전체") url = `/admin/targetsales/status/user/${salesperson}?year=${year}`;

        const response = await api.get(url);
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

const onFilterChange = () => {
    fetchMonthlySalesData(selectedYear.value, selectedDepartment.value, selectedSalesperson.value);
    fetchMonthlyTargetSalesData(selectedYear.value, selectedDepartment.value, selectedSalesperson.value);
};

watch(selectedDepartment, (newDeptName) => {
    if (newDeptName) {
        const selectedDept = departmentNames.value.find(dept => dept.name === newDeptName);

        selectedSalesperson.value = "전체";

        if (selectedDept) fetchUsersByDepartment(selectedDept.no);
    }
    onFilterChange();
});
watch(selectedYear, onFilterChange);
watch(selectedSalesperson, onFilterChange);

onMounted(() => {
    fetchDepartments();
    onFilterChange();
});


</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12" md="2">
            <v-card elevation="0" class="pa-4">
                <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                <v-select  v-model="selectedYear" :items="yearOptions"></v-select>
                <v-select label="부서" v-model="selectedDepartment" :items="departmentLabels"></v-select>
                <v-select label="영업 사원" v-model="selectedSalesperson" :items="salespersonNames"></v-select>
            </v-card>
        </v-col>
        <v-col cols="12" md="10">
            <UiParentCard title="월별 목표 매출 차트">
                <apexchart type="bar" height="300" :options="chartOptions" :series="columnChart.series"> </apexchart>
            </UiParentCard>
        </v-col>
    </v-row>
</template>
