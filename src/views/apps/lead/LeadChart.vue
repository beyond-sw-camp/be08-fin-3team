<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import api from '@/api/axiosinterceptor';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import Month from '@/components/lead/Month.vue';
import Status from '@/components/lead/Status.vue';
import Process from '@/components/lead/Process.vue';
import Path from '@/components/lead/Path.vue';
import Success from '@/components/lead/Success.vue';

const userRole = ref(true);

const page = ref({ title: '차트' });
const breadcrumbs = ref([
    { text: '차트', disabled: false, href: '#' },
    { text: '영업 예측', disabled: true, href: '#' }
]);

const today = new Date();
const year = today.getFullYear();
const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
firstDayOfYear.setHours(firstDayOfYear.getHours() + 3);
const lastDayOfYear = new Date(Date.UTC(year, 11, 31, 3, 0, 0));
const searchStartDate = ref(firstDayOfYear.toISOString().substring(0, 10));
const searchEndDate = ref(lastDayOfYear.toISOString().substring(0, 10));

const selectedDept = ref(0);
const selectedManager = ref(0);
const state = reactive({
    departments: [],
    managers: []
});

const searchCond = reactive({
    startDate: searchStartDate.value,
    endDate: searchEndDate.value,
    deptNo: selectedManager.value,
    userNo: selectedManager.value
});

const isMounted = ref(false);

const monthData = reactive([]);
const statusData = reactive([]);
const processData = reactive([]);
const pathData = reactive([]);
const sucessData = reactive([]);

const fetchDept = async () => {
    try {
        const response = await api.get(`/admin/departments`);

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

const fetchData = async () => {
    try {
        const [monthRes, statusRes, pathRes, sucessRes] = await Promise.all([
            api.post('/leads/chart/month', searchCond),
            api.post('/leads/status/main', searchCond),
            // api.post('/leads/chart/process', searchCond),
            api.post('/leads/chart/path', searchCond),
            api.post('/leads/chart/success', searchCond)
        ]);

        monthData.values = monthRes.data.result;
        statusData.values = statusRes.data.result;
        pathData.values = pathRes.data.result;
        sucessData.values = sucessRes.data.result;

        // console.log(statusData.values);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

watch(selectedDept, (newDept) => {
    if (newDept != null) {
        searchCond.deptNo = newDept;
        selectedManager.value = 0;
        fetchUser(newDept);
    }
});

watch(searchStartDate, (newDate) => {
    searchCond.startDate = newDate;
});

watch(searchEndDate, (newDate) => {
    searchCond.endDate = newDate;
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
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="2">
                <v-card elevation="0" class="pa-4">
                    <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                    <v-text-field label="시작일자" v-model="searchStartDate" type="date" outlined></v-text-field>
                    <v-text-field label="종료일자" v-model="searchEndDate" type="date" outlined></v-text-field>
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
                <v-row>
                    <v-col cols="12">
                        <UiParentCard title="월별 현황">
                            <Month :month-data="monthData.values" />
                        </UiParentCard>
                    </v-col>
                    <!-- <v-col cols="12" lg="6">
                        <UiParentCard title="프로세스">
                            <Process />
                        </UiParentCard>
                    </v-col> -->
                    <v-col cols="12" lg="6">
                        <UiParentCard title="진행상태">
                            <Status :status-data="statusData.values" />
                        </UiParentCard>
                    </v-col>
                    <v-col cols="12" lg="6">
                        <UiParentCard title="성공확률">
                            <Success :sucess-data="sucessData.values" />
                        </UiParentCard>
                    </v-col>
                    <v-col cols="12">
                        <UiParentCard title="인지경로">
                            <Path :path-data="pathData.values" />
                        </UiParentCard>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss"></style>
