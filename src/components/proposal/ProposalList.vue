<script setup>
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import { useExcelDownloader } from '@/composables/useExcel';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const { downloadExcel, getTableDataForExcel } = useExcelDownloader();

const showConfirmDialogs = ref(false);

const page = ref({ title: '제안 목록' });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '제안', disabled: true, href: '#' }
]);

const userRole = ref(localStorage.getItem('loginUserRole') !== 'ADMIN');
const isMounted = ref(false);

const proposals = ref([]);
const dialogEdit = ref(false);
const router = useRouter();

const searchDates = reactive({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 10)
});

const state = reactive({
    departments: [],
    managers: [],
    selected: {
        submitDate: '',
        propName: '',
        dept: 0,
        manager: 0
    }
});

const searchCond = computed(() => ({
    startDate: searchDates.startDate,
    endDate: searchDates.endDate,
    submitDate: state.selected.selsubmitDate,
    propName: state.selected.propName,
    deptNo: state.selected.dept,
    userNo: state.selected.manager
}));

const dataSize = computed(() => proposals.value.length);

const defaultItem = ref({
    propNo: null,
    leadNo: null,
    leadName: '',
    name: '',
    cont: '',
    reqDate: '',
    startDate: '',
    endDate: '',
    submitDate: '',
    prDate: '',
    note: ''
});

const headers = ref([
    { title: '제안명', key: 'name' },
    { title: '영업기회명', key: 'leadName' },
    { title: '요청일', key: 'reqDate' },
    { title: '제출일', key: 'submitDate' },
    { title: '제안 시작일', key: 'startDate' },
    { title: '제안 종료일', key: 'endDate' },
    { title: '', key: 'actions', sortable: false }
]);

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
        const response = await api.post('/proposals/search', searchCond.value);

        proposals.value = response.data.result;
    } catch (error) {
        console.error('Failed to search proposals:', error);
        triggerAlert('검색에 실패했습니다.', 'error');
    }
};

const deleteProposalApi = async () => {
    try {
        await api.delete(`/proposals/${defaultItem.value.propNo}`);
        const index = proposals.value.findIndex((item) => item.propNo === defaultItem.value.propNo);
        if (index !== -1) {
            proposals.value.splice(index, 1);
        }

        triggerAlert('제안이 삭제되었습니다.', 'success', 2000, '/proposals');
        resetForm();
    } catch (error) {
        triggerAlert('제안 삭제를 실패했습니다.', 'error', 2000);
    }
};

const excelDown = () => downloadExcel(getTableDataForExcel(proposals.value), '제안목록.xlsx');

watch(
    () => state.selected.dept,
    (newDept) => {
        state.selected.manager = 0;
        fetchUser(newDept);
    }
);

['submitDate', 'manager'].forEach((field) => {
    watch(
        () => state.selected[field],
        (newValue) => (searchCond.value[field] = newValue)
    );
});

const resetForm = () => {
    defaultItem.value = { ...defaultItem.value };
    defaultItem.value = -1;
};

const confirmDelete = async () => {
    await deleteProposalApi();
    showConfirmDialogs.value = false;
};

const closeDeleteDialog = () => {
    showConfirmDialogs.value = false;
};

const deleteItem = (item) => {
    defaultItem.value = { ...item };
    showConfirmDialogs.value = true;
};

const navigateToCreate = () => {
    router.push('/proposals/create');
};

const closeEditDialog = () => {
    resetForm();
    dialogEdit.value = false;
};

const goToDetailProposal = (propNo) => {
    router.push(`/proposals/${propNo}`);
};

const displayedProposals = computed(() => proposals.value);

const alertDialog = ref(false);

onMounted(() => {
    fetchDept();
});
</script>

<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />

    <v-dialog v-model="alertDialog" max-width="500" class="dialog-mw">
        <v-card>
            <v-card-actions>
                <v-btn color="primary" block @click="alertDialog = false" flat>Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

    <v-row>
        <!-- 검색 -->
        <v-col cols="12" md="2">
            <v-card elevation="0" class="pa-4">
                <v-card-title class="title font-weight-bold">검색 조건</v-card-title>
                <v-text-field v-model="searchDates.startDate" label="시작일자" type="date" />
                <v-text-field v-model="searchDates.endDate" label="종료일자" type="date" />
                <v-text-field v-model="state.selected.submitDate" label="제출일자" type="date"></v-text-field>
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

        <!-- 제안 테이블 -->
        <v-col cols="12" md="10">
            <v-card elevation="0" class="pa-4">
                <v-row class="d-flex align-center mb-1">
                    <v-col cols="auto">
                        <v-card-title class="mb-0 custom-title">검색결과: {{ dataSize }}건</v-card-title>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto">
                        <v-btn variant="tonal" color="success" class="mr-2" @click="excelDown">
                            <v-icon left>mdi-file-excel</v-icon>
                            엑셀 다운
                        </v-btn>
                        <v-btn color="primary" variant="tonal" class="mr-6" @click="navigateToCreate">제안 생성</v-btn>
                    </v-col>
                </v-row>

                <v-divider :thickness="3" class="border-opacity-50 thick-divider" color="info"></v-divider>

                <v-data-table
                    :key="proposals.length"
                    :headers="headers"
                    :items="displayedProposals"
                    :sort-by="[{ key: 'reqDate', order: 'asc' }]"
                    item-key="propNo"
                    show-actions
                >
                    <template v-slot:item.actions="{ item }">
                        <EditIcon
                            height="20"
                            width="20"
                            class="mr-2 text-primary cursor-pointer"
                            size="small"
                            @click="goToDetailProposal(item.propNo)"
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
