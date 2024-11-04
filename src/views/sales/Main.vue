<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import api from '@/api/axiosinterceptor';

import Customer from '@/components/sales/main/Customer.vue';
import LeadAct from '@/components/sales/main/LeadAct.vue';
import Sales from '@/components/sales/main/Sales.vue';

const userRole = ref(true);

const today = new Date();
const searchDate = ref(today.toISOString().substring(0, 10));
const selectedDept = ref(0);
const selectedManager = ref(0);
const state = reactive({
    departments: [],
    managers: []
});

const searchCond = reactive({
    searchDate: searchDate.value,
    deptNo: selectedManager.value,
    userNo: selectedManager.value
});

const isMounted = ref(false);

const customerCount = ref(0);
const potenCustomerCount = ref(0);
const progressCount = ref(0);
const successCount = ref(0);
const failCount = ref(0);
const holdCount = ref(0);
const planCount = ref(0);
const completeCount = ref(0);
const completePercent = ref(0);
const yearTarget = ref('0');
const yearResult = ref('0');
const yearAchievement = ref(0);
const monthTarget = ref('0');
const monthResult = ref('0');
const monthAchievement = ref(0);

const fetchDept = async () => {
    try {
        const response = await api.get(`/admin/departments/child`);
        //123
        state.departments = [{ no: 0, name: '전체' }, ...response.data.result];

        if (response.data.isSuccess) {
            if (userRole.value) {
                const deptNo = localStorage.getItem('loginDeptNo');
                selectedDept.value = deptNo ? Number(deptNo) : 0;
            }

            fetchUser(selectedDept.value);
        }
    } catch (error) {
        console.error('부서 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const fetchUser = async (deptNo) => {
    try {
        let response;

        if (deptNo != null && deptNo > 1 && deptNo != 'undefined') {
            response = await api.get(`/users/by-dept/${deptNo}`);

            state.managers = [{ userNo: 0, name: '전체' }, ...response.data.result];

            if (response.data.isSuccess) {
                if (userRole.value) {
                    const userNo = localStorage.getItem('loginUserNo');
                    selectedManager.value = userNo ? Number(userNo) : 0;
                }
            }
        } else {
            state.managers = [{ userNo: 0, name: '전체' }];
        }

        if (!isMounted.value) {
            fetchData();
        }
        isMounted.value = true;
    } catch (error) {
        console.error('user 데이터를 불러오는 중 오류가 발생했습니다.');
    }
};

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const fetchData = async () => {
    try {
        const [customerResponse, potenCustomerResponse, leadResponse, actResponse, salesResponse, targetSalesResponse] = await Promise.all([
            api.post('/customers/status/main', searchCond),
            api.post('/pcustomers/status/main', searchCond),
            api.post('/leads/status/main', searchCond),
            api.post('/acts/status/main', searchCond),
            api.post('/sales/status/main', searchCond),
            api.post('/admin/targetsales/status/main', searchCond)
        ]);

        customerCount.value = customerResponse.data.result;
        potenCustomerCount.value = potenCustomerResponse.data.result;

        if (leadResponse.data.result.find((l) => l.status === 'PROGRESS') != null) {
            progressCount.value = leadResponse.data.result.find((l) => l.status === 'PROGRESS').count;
        } else {
            progressCount.value = 0;
        }

        if (leadResponse.data.result.find((l) => l.status === 'SUCCESS') != null) {
            successCount.value = leadResponse.data.result.find((l) => l.status === 'SUCCESS').count;
        } else {
            successCount.value = 0;
        }

        if (leadResponse.data.result.find((l) => l.status === 'FAIL') != null) {
            failCount.value = leadResponse.data.result.find((l) => l.status === 'FAIL').count;
        } else {
            failCount.value = 0;
        }

        if (leadResponse.data.result.find((l) => l.status === 'HOLD') != null) {
            holdCount.value = leadResponse.data.result.find((l) => l.status === 'HOLD').count;
        } else {
            holdCount.value = 0;
        }

        planCount.value = actResponse.data.planCount;
        completeCount.value = actResponse.data.completeCount;
        completePercent.value = actResponse.data.completePercent;

        if (targetSalesResponse.data.result.yearTargetSales > 0) {
            yearTarget.value = formatNumber(targetSalesResponse.data.result.yearTargetSales);
        } else {
            yearTarget.value = '0';
        }

        if (targetSalesResponse.data.result.monthTargetSales > 0) {
            monthTarget.value = formatNumber(targetSalesResponse.data.result.monthTargetSales);
        } else {
            monthTarget.value = '0';
        }

        if (salesResponse.data.result.yearSales > 0) {
            yearResult.value = formatNumber(salesResponse.data.result.yearSales);
        } else {
            yearResult.value = '0';
        }

        if (salesResponse.data.result.monthSales > 0) {
            monthResult.value = formatNumber(salesResponse.data.result.monthSales);
        } else {
            monthResult.value = '0';
        }

        if (salesResponse.data.result.yearSales > 0) {
            yearAchievement.value = parseFloat(
                ((salesResponse.data.result.yearSales * 100) / targetSalesResponse.data.result.yearTargetSales).toFixed(2)
            );
        } else {
            yearAchievement.value = 0;
        }

        if (salesResponse.data.result.monthSales > 0) {
            monthAchievement.value = parseFloat(
                ((salesResponse.data.result.monthSales * 100) / targetSalesResponse.data.result.monthTargetSales).toFixed(2)
            );
        } else {
            monthAchievement.value = 0;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

watch(
    () => selectedDept.value,
    (newDept) => {
        if (newDept != null) {
            searchCond.deptNo = newDept;
            selectedManager.value = 0;
            fetchUser(newDept);
        }
    }
);

watch(searchDate, (newDate) => {
    searchCond.searchDate = newDate;
});

watch(selectedManager, (newUser) => {
    searchCond.userNo = newUser;
});

onMounted(() => {
    if (localStorage.getItem('loginUserRole') == 'ADMIN') {
        userRole.value = false;
    }

    fetchDept();
});
</script>

<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="2">
                <v-card elevation="0" class="pa-4">
                    <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                    <v-text-field label="날짜" v-model="searchDate" type="date" outlined></v-text-field>
                    <v-select
                        label="부서"
                        v-model="selectedDept"
                        :items="state.departments"
                        item-props="true"
                        item-title="name"
                        item-value="no"
                        outlined
                        :disabled="userRole"
                    ></v-select>
                    <v-select
                        label="담당자"
                        v-model="selectedManager"
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
                        <Customer :customer-count="customerCount" :poten-customer-count="potenCustomerCount" />
                        <LeadAct
                            :progress-count="progressCount"
                            :success-count="successCount"
                            :fail-count="failCount"
                            :hold-count="holdCount"
                            :plan-count="planCount"
                            :complete-count="completeCount"
                            :complete-percent="completePercent"
                        />
                    </v-row>
                    <Sales
                        :year-target="yearTarget"
                        :year-result="yearResult"
                        :year-achievement="yearAchievement"
                        :month-target="monthTarget"
                        :month-result="monthResult"
                        :month-achievement="monthAchievement"
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
