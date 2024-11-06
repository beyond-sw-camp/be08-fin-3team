<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const showConfirmDialogs = ref(false);

const page = ref({ title: '제안 목록' });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '제안', disabled: true, href: '#' }
]);

const formTitle = computed(() => (defaultItem.value === -1 ? '제안 추가' : '제안 수정'));

const proposals = ref([]);
const dialogEdit = ref(false);
const router = useRouter();

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

const dataSize = computed(() => proposals.value.length);

async function initialize() {
    try {
        const response = await api.get('/proposals');

        proposals.value = response.data;

        console.log(proposals.value);
    } catch (error) {
        console.error('Failed to fetch proposals:', error);
    }
}

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

initialize();

const alertDialog = ref(false);

const propName = ref('');
const reqDate = ref('');
const startDate = ref('');

const search = async () => {
    try {
        const response = await api.post('/proposals/search', {
            propName: propName.value || undefined,
            reqDate: reqDate.value || undefined,
            startDate: startDate.value || undefined
        });
        proposals.value = response.data.result;
    } catch (error) {
        console.error('Failed to search proposals:', error);
        triggerAlert('검색에 실패했습니다.', 'error');
    }
};
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
                <v-text-field
                    v-model="propName"
                    color="primary"
                    variant="outlined"
                    type="text"
                    placeholder="제안명"
                    hide-details
                    class="mb-4"
                ></v-text-field>
                <v-text-field v-model="reqDate" label="요청일" type="date"></v-text-field>
                <v-text-field v-model="startDate" label="제안시작일" type="date"></v-text-field>
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
                    <v-col cols="auto"> </v-col>
                    <v-btn color="primary" variant="tonal" class="mr-6" @click="navigateToCreate">제안 생성</v-btn>
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
