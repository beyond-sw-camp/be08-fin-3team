<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import api from '@/api/axiosinterceptor';
import { useRouter } from 'vue-router';

const router = useRouter();

const userRole = ref(true);
const isMounted = ref(false);

const goToLeadDetail = (leadNo) => {
    router.push(`/sales/lead/detail/${leadNo}`);
};

const selectedStatus = ref(null);
const statuses = ref([
    { text: '전체', value: null },
    { text: '진행중', value: 'PROGRESS' },
    { text: '종료(실패)', value: 'FAIL' },
    { text: '종료(성공)', value: 'SUCCESS' },
    { text: '보류', value: 'HOLD' }
]);
const selectedProcess = ref(0);
const processes = ref([
    { text: '전체', value: 0 },
    { text: '기회인지', value: 1 },
    { text: '상담', value: 2 },
    { text: '제안', value: 3 },
    { text: '협상', value: 4 },
    { text: '계약', value: 5 }
]);

const startDate = new Date();
startDate.setMonth(startDate.getMonth() - 1);
startDate.setDate(1);
const searchStartDate = ref(startDate.toISOString().substring(0, 10));

const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 2);
endDate.setDate(0);
const searchEndDate = ref(endDate.toISOString().substring(0, 10));

const selectedDept = ref(0);
const selectedManager = ref(0);
const state = reactive({
    departments: [],
    managers: []
});

const searchCond = reactive({
    status: selectedStatus.value,
    subProcess: selectedProcess.value,
    startDate: searchStartDate.value,
    endDate: searchEndDate.value,
    deptNo: selectedDept.value,
    userNo: selectedManager.value
});

const leads = ref([]);
const dataSize = computed(() => leads.value.length);
const loading = ref(true);
const error = ref(null);

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
    loading.value = true;
    error.value = null;

    try {
        const response = await api.post('/leads/filter', searchCond);

        leads.value = response.data.result;
    } catch (err) {
        console.error('데이터 로딩 중 오류 발생:', err);
        error.value = '데이터를 가져오는 중 오류가 발생했습니다.';
    } finally {
        loading.value = false;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'PROGRESS':
            return '진행중';
        case 'FAIL':
            return '실패';
        case 'SUCCESS':
            return '성공';
        case 'HOLD':
            return '보류';
        default:
            return '알 수 없음';
    }
};

const getStepColor = (step) => {
    if (step.completeYn == 'Y') {
        switch (step.level) {
            case 0:
                return 'error';
            case 1:
                return 'warning';
            case 2:
                return 'success';
            case 3:
                return 'secondary';
            case 4:
                return 'primary';
        }
    }
    return 'grey lighten-2'; // 미완료 단계
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

watch(searchStartDate, (newDate) => {
    searchCond.startDate = newDate;
});

watch(searchEndDate, (newDate) => {
    searchCond.endDate = newDate;
});

watch(selectedStatus, (newDate) => {
    searchCond.status = newDate;
});

watch(selectedProcess, (newDate) => {
    searchCond.subProcess = newDate;
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
                    <v-text-field v-model="searchStartDate" label="시작일자" type="date"></v-text-field>
                    <v-text-field v-model="searchEndDate" label="종료일자" type="date"></v-text-field>
                    <v-select
                        v-model="selectedStatus"
                        :items="statuses"
                        item-props="true"
                        item-title="text"
                        item-value="value"
                        label="진행상태"
                        class="mt-4"
                    ></v-select>
                    <v-select
                        v-model="selectedProcess"
                        :items="processes"
                        item-props="true"
                        item-title="text"
                        item-value="value"
                        label="진행단계"
                    ></v-select>
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
                    <v-btn class="search_btn" variant="flat" color="primary" @click="fetchData">검색</v-btn>
                </v-card>
            </v-col>
            <v-col cols="12" md="10">
                <v-card elevation="0" class="pa-4">
                    <v-row class="d-flex align-center">
                        <v-col cols="auto">
                            <v-card-title>검색결과: {{ dataSize }}건</v-card-title>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="auto">
                            <v-btn variant="tonal" color="primary" to="/sales/lead/new" class="mb-3">영업기회 생성</v-btn>
                        </v-col>
                    </v-row>
                    <v-divider :thickness="3" class="border-opacity-50 thick-divider" color="info"></v-divider>
                    <v-row v-if="error">
                        <v-col cols="12">
                            <v-alert type="error">{{ error }}</v-alert>
                        </v-col>
                    </v-row>

                    <v-row v-if="!loading && leads.length">
                        <v-col v-for="lead in leads" :key="lead.leadNo" cols="12" md="12">
                            <v-card outlined>
                                <v-card-title @click="goToLeadDetail(lead.leadNo)" class="cursor-pointer">
                                    <span class="font-weight-bold">[{{ getStatusLabel(lead.status) }}] {{ lead.name }}</span>
                                </v-card-title>
                                <v-divider></v-divider>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-row>
                                                <v-col v-for="step in lead.steps" :key="step.stepNo" cols="auto">
                                                    <v-chip :color="getStepColor(step)" class="white--text">
                                                        {{ step.subProcessName }}
                                                        <span v-if="step.completeYn == 'Y'"> {{ step.completeDate }}</span>
                                                    </v-chip>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">고객명: {{ lead.customerName }}</v-col>
                                        <v-col cols="4">예상 매출: {{ lead.expSales }}</v-col>
                                        <v-col cols="4">기간: {{ lead.startDate }} ~ {{ lead.endDate }}</v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" class="text-right">
                                            <v-chip color="orange" class="white--text">성공 확률 {{ lead.successPer }}%</v-chip>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-row v-if="!loading && leads.length === 0">
                        <v-col cols="12">
                            <v-alert type="info">검색 결과가 없습니다.</v-alert>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss" scoped>
.title {
    font-size: 16px;
}

.search_btn {
    width: 100%;
}

.font-weight-bold {
    font-weight: bold;
}

.card-hover {
    transition: box-shadow 0.3s ease-in-out;
}
.card-hover:hover {
    box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1);
}

.text-right {
    text-align: right;
}

.thick-divider {
    margin-bottom: 10px;
}
</style>
