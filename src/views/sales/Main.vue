<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import api from '@/api/axiosinterceptor';
import { useAlert } from '@/utils/useAlert';

import AlertComponent from '@/components/shared/AlertComponent.vue';
import Customer from '@/components/sales/main/Customer.vue';
import LeadAct from '@/components/sales/main/LeadAct.vue';
import Sales from '@/components/sales/main/Sales.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const userRole = ref(localStorage.getItem('loginUserRole') !== 'ADMIN');

const today = new Date();
const searchDate = ref(today.toISOString().substring(0, 10));
const isMounted = ref(false);

const state = reactive({
    departments: [],
    managers: [],
    selected: {
        dept: 0,
        manager: 0
    },
    customerCount: 0,
    potenCustomerCount: 0,
    leadStatusCounts: {
        PROGRESS: 0,
        SUCCESS: 0,
        FAIL: 0,
        HOLD: 0
    },
    actCounts: {
        planCount: 0,
        completeCount: 0,
        completePercent: 0
    },
    salesTargets: {
        yearTarget: '0',
        monthTarget: '0',
        yearResult: '0',
        monthResult: '0',
        yearAchievement: 0,
        monthAchievement: 0
    }
});

const searchCond = computed(() => ({
    searchDate: searchDate.value,
    deptNo: state.selected.dept,
    userNo: state.selected.manager
}));

const fetchDept = async () => {
    try {
        const response = await api.get(`/admin/departments/child`);

        state.departments = [{ no: 0, name: '전체' }, ...response.data.result];

        if (response.data.isSuccess) {
            if (userRole.value) {
                state.selected.dept = Number(localStorage.getItem('loginDeptNo')) || 0;
            }

            fetchUser(state.selected.dept);
        } else {
            triggerAlert(response.data.message, 'error');
        }
    } catch (error) {
        console.error('부서 데이터를 불러오는 중 오류가 발생했습니다:', error);
        triggerAlert('부서 정보 조회 중 오류가 발생했습니다', 'error');
    }
};

const fetchUser = async (deptNo) => {
    try {
        const response = deptNo > 0 ? await api.get(`/users/by-dept/${deptNo}`) : null;
        state.managers = response ? [{ userNo: 0, name: '전체' }, ...response.data.result] : [{ userNo: 0, name: '전체' }];
        if (userRole.value) {
            state.selected.manager = Number(localStorage.getItem('loginUserNo')) || 0;
        }
        if (!isMounted.value) fetchData();
        isMounted.value = true;
    } catch (error) {
        console.error('유저 데이터를 불러오는 중 오류:', error);
    }
};

const fetchData = async () => {
    try {
        const [customerResponse, potenCustomerResponse, leadResponse, actResponse, salesResponse, targetSalesResponse] = await Promise.all([
            api.post('/customers/status/main', searchCond.value),
            api.post('/pcustomers/status/main', searchCond.value),
            api.post('/leads/status/main', searchCond.value),
            api.post('/acts/status/main', searchCond.value),
            api.post('/sales/status/main', searchCond.value),
            api.post('/admin/targetsales/status/main', searchCond.value)
        ]);

        state.customerCount = customerResponse.data.result || 0;
        state.potenCustomerCount = potenCustomerResponse.data.result || 0;

        state.leadStatusCounts = leadResponse.data.result.reduce(
            (acc, { status, count }) => {
                acc[status] = count || 0;
                return acc;
            },
            { PROGRESS: 0, SUCCESS: 0, FAIL: 0, HOLD: 0 }
        );

        Object.assign(state.actCounts, {
            planCount: actResponse.data.planCount || 0,
            completeCount: actResponse.data.completeCount || 0,
            completePercent: actResponse.data.completePercent || 0
        });

        const yearTargetSales = targetSalesResponse.data.result.yearTargetSales || 0;
        const monthTargetSales = targetSalesResponse.data.result.monthTargetSales || 0;
        const yearSales = salesResponse.data.result.yearSales || 0;
        const monthSales = salesResponse.data.result.monthSales || 0;

        Object.assign(state.salesTargets, {
            yearTarget: formatNumber(yearTargetSales),
            monthTarget: formatNumber(monthTargetSales),
            yearResult: formatNumber(yearSales),
            monthResult: formatNumber(monthSales),
            yearAchievement: yearTargetSales > 0 ? parseFloat(((yearSales * 100) / yearTargetSales).toFixed(2)) : 0,
            monthAchievement: monthTargetSales > 0 ? parseFloat(((monthSales * 100) / monthTargetSales).toFixed(2)) : 0
        });
    } catch (error) {
        triggerAlert('메인 정보 조회 중 오류가 발생했습니다', 'error');
        console.error('데이터 조회중 오류 발생', error);
    }
};

const formatNumber = (value) => new Intl.NumberFormat().format(value);

watch(
    () => state.selected.dept,
    (newDept) => {
        state.selected.manager = 0;
        fetchUser(newDept);
    }
);

onMounted(() => {
    fetchDept();
});
</script>

<template>
    <v-container fluid>
        <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
        <v-row>
            <v-col cols="12" md="2">
                <v-card elevation="0" class="pa-4">
                    <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                    <v-text-field label="날짜" v-model="searchDate" type="date" outlined></v-text-field>
                    <v-select
                        label="부서"
                        v-model="state.selected.dept"
                        :items="state.departments"
                        item-props="true"
                        item-title="name"
                        item-value="no"
                        outlined
                        :disabled="userRole"
                    ></v-select>
                    <v-select
                        label="담당자"
                        v-model="state.selected.manager"
                        :items="state.managers"
                        item-props="true"
                        item-title="name"
                        item-value="userNo"
                        outlined
                        :disabled="userRole"
                    ></v-select>
                    <v-btn class="search_btn" color="primary" variant="flat" @click="fetchData">검색</v-btn>
                </v-card>
            </v-col>
            <v-col cols="12" md="10">
                <v-card elevation="0" class="pa-4">
                    <v-card-title class="title font-weight-bold">종합현황</v-card-title>
                    <v-divider :thickness="3" class="border-opacity-50 mb-5" color="primary"></v-divider>
                    <v-row>
                        <Customer :customer-count="state.customerCount" :poten-customer-count="state.potenCustomerCount" />
                        <LeadAct
                            :progress-count="state.leadStatusCounts.PROGRESS"
                            :success-count="state.leadStatusCounts.SUCCESS"
                            :fail-count="state.leadStatusCounts.FAIL"
                            :hold-count="state.leadStatusCounts.HOLD"
                            :plan-count="state.actCounts.planCount"
                            :complete-count="state.actCounts.completeCount"
                            :complete-percent="state.actCounts.completePercent"
                        />
                    </v-row>
                    <Sales
                        :year-target="state.salesTargets.yearTarget"
                        :year-result="state.salesTargets.yearResult"
                        :year-achievement="state.salesTargets.yearAchievement"
                        :month-target="state.salesTargets.monthTarget"
                        :month-result="state.salesTargets.monthResult"
                        :month-achievement="state.salesTargets.monthAchievement"
                    />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.title {
    font-weight: bold;
    font-size: 16px;
}

.sub_title {
    font-weight: bold;
    font-size: 14px;
}

.search_btn {
    width: 100%;
}
</style>
