<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import api from '@/api/axiosinterceptor';
import { useRouter } from 'vue-router';
import { useExcelDownloader } from '@/composables/useExcel';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const router = useRouter();

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const userRole = ref(localStorage.getItem('loginUserRole') !== 'ADMIN');
const isMounted = ref(false);

const { downloadExcel, getTableDataForExcel } = useExcelDownloader();

const goToLeadDetail = (leadNo) => router.push(`/sales/lead/detail/${leadNo}`);

const statuses = ref([
    { text: '전체', value: null },
    { text: '진행중', value: 'PROGRESS' },
    { text: '종료(실패)', value: 'FAIL' },
    { text: '종료(성공)', value: 'SUCCESS' },
    { text: '보류', value: 'HOLD' }
]);

const searchDates = reactive({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().substring(0, 10)
});

const state = reactive({
    departments: [],
    managers: [],
    processes: [],
    subProcesses: [],
    leads: [],
    selected: {
        status: null,
        process: 0,
        subProcess: 0,
        dept: 0,
        manager: 0
    },
    loading: true,
    error: null
});

const searchCond = computed(() => ({
    status: state.selected.status,
    process: state.selected.process,
    subProcess: state.selected.subProcess,
    startDate: searchDates.startDate,
    endDate: searchDates.endDate,
    deptNo: state.selected.dept,
    userNo: state.selected.manager
}));

const dataSize = computed(() => state.leads.length);

const fetchProcess = async () => {
    try {
        const response = await api.get(`/admin/processes`);

        if (response.data.isSuccess) {
            state.processes = [{ processNo: 0, processName: '전체' }, ...response.data.result];
            state.subProcesses = [{ subProcessNo: 0, subProcessName: '전체' }];
        } else {
            triggerAlert(response.data.message, 'error');
        }
    } catch (error) {
        console.error('부서 데이터를 불러오는 중 오류가 발생했습니다:', error);
        triggerAlert('부서 정보 조회 중 오류가 발생했습니다', 'error');
    }
};

const getProcessNameByNo = (processNo) => {
    const process = state.processes.find((p) => p.processNo === processNo);
    return process ? process.processName : '';
};

const fetchSubProcess = async () => {
    try {
        const processName = getProcessNameByNo(state.selected.process);
        const response = await api.get(`/admin/subprocesses/${processName}`);

        if (response.data.isSuccess) {
            state.subProcesses = [{ subProcessNo: 0, subProcessName: '전체' }, ...response.data.result];
        } else {
            triggerAlert(response.data.message, 'error');
        }

        console.log(state.subProcesses);
    } catch (error) {
        console.error('진행단계(서브 프로세스) 데이터를 불러오는 중 오류가 발생했습니다:', error);
        triggerAlert('진행단계 정보 조회 중 오류가 발생했습니다', 'error');
    }
};

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
    state.loading = true;
    state.error = null;

    try {
        const response = await api.post('/leads/filter', searchCond.value);
        state.leads = response.data.result;
    } catch (error) {
        console.error('영업기회 데이터 조회 중 오류가 발생했습니다.', error);
        triggerAlert('영업기회 정보 조회 중 오류가 발생했습니다', 'error');
        state.error = '데이터를 가져오는 중 오류가 발생했습니다.';
    } finally {
        state.loading = false;
    }
};

const getStatusLabel = (status) =>
    ({
        PROGRESS: '진행중',
        FAIL: '실패',
        SUCCESS: '성공',
        HOLD: '보류'
    })[status] || '알 수 없음';

const getStepColor = (step) =>
    step.completeYn === 'Y' ? ['error', 'warning', 'success', 'secondary', 'primary'][step.level] : 'grey lighten-2';

const excelDown = () => downloadExcel(getTableDataForExcel(state.leads), '영업기회.xlsx');

watch(
    () => state.selected.process,
    (newProcess) => {
        state.selected.subProcess = 0;
        if (newProcess > 0) {
            fetchSubProcess(newProcess);
        } else {
            state.subProcesses = [{ subProcessNo: 0, subProcessName: '전체' }];
        }
    }
);

watch(
    () => state.selected.dept,
    (newDept) => {
        state.selected.manager = 0;
        fetchUser(newDept);
    }
);

['status', 'subProcess', 'manager'].forEach((field) => {
    watch(
        () => state.selected[field],
        (newValue) => (searchCond.value[field] = newValue)
    );
});

onMounted(() => {
    fetchProcess();
    fetchDept();
});
</script>

<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="2">
                <v-card elevation="0" class="pa-4">
                    <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                    <v-text-field v-model="searchDates.startDate" label="시작일자" type="date" />
                    <v-text-field v-model="searchDates.endDate" label="종료일자" type="date" />
                    <v-select
                        v-model="state.selected.status"
                        :items="statuses"
                        item-props="true"
                        item-title="text"
                        item-value="value"
                        label="진행상태"
                        class="mt-4"
                    />
                    <v-select
                        label="프로세스"
                        v-model="state.selected.process"
                        :items="state.processes"
                        item-props="true"
                        item-title="processName"
                        item-value="processNo"
                        outlined
                    />
                    <v-select
                        label="진행단계"
                        v-model="state.selected.subProcess"
                        :items="state.subProcesses"
                        item-props="true"
                        item-title="subProcessName"
                        item-value="subProcessNo"
                        outlined
                    />
                    <v-select
                        label="부서"
                        v-model="state.selected.dept"
                        :items="state.departments"
                        item-props="true"
                        item-title="name"
                        item-value="no"
                        outlined
                        :disabled="userRole"
                    />
                    <v-select
                        label="담당자"
                        v-model="state.selected.manager"
                        :items="state.managers"
                        item-props="true"
                        item-title="name"
                        item-value="userNo"
                        outlined
                        :disabled="userRole"
                    />
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
                            <v-btn variant="tonal" color="success" class="mr-2 mb-3" @click="excelDown">
                                <v-icon left>mdi-file-excel</v-icon>
                                엑셀 다운
                            </v-btn>
                            <v-btn variant="tonal" color="primary" to="/sales/lead/new" class="mb-3">영업기회 생성</v-btn>
                        </v-col>
                    </v-row>
                    <v-divider :thickness="3" class="border-opacity-50 thick-divider" color="info" />
                    <v-row v-if="state.error">
                        <v-col cols="12">
                            <v-alert type="error">{{ state.error }}</v-alert>
                        </v-col>
                    </v-row>

                    <v-row v-if="!state.loading && state.leads.length">
                        <v-col v-for="lead in state.leads" :key="lead.leadNo" cols="12" md="12">
                            <v-card outlined>
                                <v-card-title @click="goToLeadDetail(lead.leadNo)" class="cursor-pointer">
                                    <span class="font-weight-bold">[{{ getStatusLabel(lead.status) }}] {{ lead.name }}</span>
                                </v-card-title>
                                <v-divider />
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-row>
                                                <v-col v-for="step in lead.steps" :key="step.stepNo" cols="auto">
                                                    <v-chip :color="getStepColor(step)" class="white--text">
                                                        {{ step.subProcessName }}
                                                        <span v-if="step.completeYn === 'Y'"> {{ step.completeDate }}</span>
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

                    <v-row v-if="!state.loading && state.leads.length === 0">
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
