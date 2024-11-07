<script setup>
import { computed, ref, reactive, onMounted, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import { useExcelDownloader } from '@/composables/useExcel';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const userRole = ref(localStorage.getItem('loginUserRole') !== 'ADMIN');
const isMounted = ref(false);

const showConfirmDialogs = ref(false); // 열림 상태 관리

const { downloadExcel, getTableDataForExcel } = useExcelDownloader();

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const page = ref({ title: '견적 목록' });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '견적', disabled: true, href: '#' }
]);

const searchDates = reactive({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 10)
});

const state = reactive({
    departments: [],
    managers: [],
    selected: {
        estName: '',
        propName: '',
        dept: 0,
        manager: 0
    }
});

const searchCond = computed(() => ({
    estName: state.selected.estName,
    propName: state.selected.propName,
    startDate: searchDates.startDate,
    endDate: searchDates.endDate,
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
        if (!isMounted.value) search();
        isMounted.value = true;
    } catch (error) {
        console.error('유저 데이터를 불러오는 중 오류:', error);
    }
};

const search = async () => {
    try {
        const response = await api.post('/estimates/search', searchCond.value);
        estimates.value = response.data.result;
    } catch (error) {
        console.error('Failed to search proposals:', error);
        triggerAlert('검색에 실패했습니다.', 'error');
    }
};

const estimates = ref([]);
const editedIndex = ref(-1);

const defaultItem = {
    estNo: null,
    propNo: null,
    propName: '',
    prodNo: null,
    prodName: '',
    estProdNo: null,
    name: '',
    estDate: '',
    taxCls: '',
    surtaxYn: '',
    prodCnt: 0,
    supplyPrice: 0,
    tax: 0,
    totalPrice: 0,
    note: ''
};

const editedItem = ref({ ...defaultItem.value });

const headers = ref([
    { title: '견적명', key: 'name', width: '150px' },
    { title: '제안명', key: 'propName', width: '150px' },
    { title: '견적일', key: 'estDate', width: '120px' },
    { title: '과세구분', key: 'taxCls', width: '120px' },
    { title: '공급가액', key: 'supplyPrice', width: '120px' },
    { title: '세액', key: 'tax', width: '100px' },
    { title: '합계금액', key: 'totalPrice', width: '120px' },
    { title: '', key: 'actions', width: '80px', sortable: false }
]);

const dataSize = computed(() => estimates.value.length);

const router = useRouter();

const goToDetailEstimate = (estNo) => {
    router.push(`/sales/estimates/${estNo}`);
};

const navigateToCreate = () => {
    router.push('/sales/estimates/new');
};

const deleteEstimateApi = async () => {
    try {
        await api.delete(`/estimates/${editedItem.value.estNo}`);

        triggerAlert('견적이 삭제되었습니다.', 'success', 2000, '/sales/estimates');

        // estimates.value.splice(editedIndex.value, 1);
        search();

        resetForm();
    } catch (error) {
        triggerAlert('견적 삭제를 실패했습니다.', 'error', 2000);
    }
};

const resetForm = () => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
};

const deleteItem = (item) => {
    editedItem.value = { ...item };
    editedIndex.value = estimates.value.indexOf(item);
    showConfirmDialogs.value = true;
};

const confirmDelete = async () => {
    await deleteEstimateApi();

    showConfirmDialogs.value = false;
};

const closeDeleteDialog = () => {
    showConfirmDialogs.value = false;
};

const displayedEstimates = computed(() =>
    estimates.value.map((estimate) => ({
        ...estimate,
        supplyPrice: formatNumber(estimate.supplyPrice),
        tax: formatNumber(estimate.tax),
        totalPrice: formatNumber(estimate.totalPrice)
    }))
);

const excelDown = () => downloadExcel(getTableDataForExcel(estimates.value), '견적목록.xlsx');

watch(
    () => state.selected.dept,
    (newDept) => {
        state.selected.manager = 0;
        fetchUser(newDept);
    }
);

['manager'].forEach((field) => {
    watch(
        () => state.selected[field],
        (newValue) => (searchCond.value[field] = newValue)
    );
});

onMounted(fetchDept);
</script>

<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <!-- 검색 -->
        <v-col cols="12" md="2">
            <v-card elevation="0" class="pa-4">
                <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                <v-text-field v-model="searchDates.startDate" label="시작일자" type="date" />
                <v-text-field v-model="searchDates.endDate" label="종료일자" type="date" />
                <v-text-field
                    label="견적명"
                    v-model="state.selected.estName"
                    color="primary"
                    variant="outlined"
                    type="text"
                    hide-details
                    class="mb-4"
                ></v-text-field>
                <v-text-field
                    label="제안명"
                    v-model="state.selected.propName"
                    color="primary"
                    variant="outlined"
                    type="text"
                    hide-details
                    class="mb-4"
                ></v-text-field>
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
                <v-btn class="search_btn" variant="flat" color="primary" @click="search">
                    <v-icon left class="mr-1">mdi-search-web</v-icon>
                    검색
                </v-btn>
            </v-card>
        </v-col>

        <!-- 견적테이블 -->
        <v-col cols="12" md="10">
            <v-card elevation="0" class="pa-4">
                <v-row class="d-flex align-center mb-1">
                    <v-col cols="auto">
                        <v-card-title class="mb-0 custom-title">검색결과: {{ dataSize }}건</v-card-title>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto">
                        <v-btn variant="tonal" color="success" class="mr-2" @click="excelDown"
                            ><v-icon left>mdi-file-excel</v-icon>엑셀 다운</v-btn
                        >
                        <v-btn color="primary" variant="tonal" class="mr-2" @click="navigateToCreate">견적 생성</v-btn>
                    </v-col>
                </v-row>

                <v-divider :thickness="3" class="border-opacity-50 thick-divider" color="info"></v-divider>

                <v-data-table
                    :headers="headers"
                    :items="displayedEstimates"
                    :sort-by="[{ key: 'estDate', order: 'asc' }]"
                    item-key="estNo"
                    show-actions
                >
                    <template v-slot:[`item.name`]="{ item }">
                        <span class="text-primary cursor-pointer" @click="goToDetailEstimate(item.estNo)">
                            {{ item.name }}
                        </span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <EditIcon
                            height="20"
                            width="20"
                            class="mr-2 text-primary cursor-pointer"
                            size="small"
                            @click="goToDetailEstimate(item.estNo)"
                        />
                        <TrashIcon height="20" width="20" class="text-error cursor-pointer" size="small" @click="deleteItem(item)" />
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>

    <ConfirmDialogs :dialog="showConfirmDialogs" @agree="confirmDelete" @disagree="closeDeleteDialog" />
</template>

<style>
.v-data-table th {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    vertical-align: middle;
}

.v-data-table th {
    text-align: center;
    vertical-align: middle;
}

.search_btn {
    width: 100%;
}

.search-field {
    margin-bottom: 16px;
}

.grey-text {
    color: grey;
}

.text-center {
    text-align: center;
}

.custom-title {
    font-size: 14px;
    color: rgb(201, 198, 198);
}
</style>
