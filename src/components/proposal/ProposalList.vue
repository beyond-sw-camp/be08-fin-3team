<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import { de } from 'date-fns/locale';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const showConfirmDialogs = ref(false); // 열림 상태 관리

const page = ref({ title: '제안 목록' });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '제안', disabled: true, href: '#' }
]);

// const dialogDelete = ref(false);
const proposals = ref([]);
// const leads = ref([]);
const dialogEdit = ref(false);
const editedIndex = ref(-1);

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

const editedItem = ref({ ...defaultItem.value });

const editItem = (item) => {
    if (item) {
        editedItem.value = {
            propNo: item.propNo,
            leadNo: item.leadNo,
            leadName: item.leadName,
            name: item.name,
            cont: item.cont,
            reqDate: item.reqDate,
            startDate: item.startDate,
            endDate: item.endDate,
            submitDate: item.submitDate,
            prDate: item.prDate,
            note: item.note
        };
        editedIndex.value = proposals.value.indexOf(item);
        dialogEdit.value = true;
    }
};

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

const formTitle = computed(() => (editedIndex.value === -1 ? '제안 추가' : '제안 수정'));

const router = useRouter();

async function initialize() {
    try {
        const response = await api.get('/proposals');

        proposals.value = response.data;

        console.log(proposals.value);
    } catch (error) {
        console.error('Failed to fetch proposals:', error);
    }
}

const submitProposalApi = async () => {
    try {
        const res = await api.post('/proposals', editedItem.value);
        console.log(res);
        if (res.status === 200) {
            triggerAlert('제안이 추가되었습니다.', 'success', 2000, '/proposals');
            // successAlert.value = true;
            // alertDialog.value = true;
            // setTimeout(() => router.push('proposals'), 1500);
            await initialize();
            resetForm();
            dialogEdit.value = false;
        }
    } catch (error) {
        console.error('등록 실패:', error);
        triggerAlert('제안 수정에 실패했습니다.', 'error');
    }
};

const updateProposalApi = async () => {
    try {
        const res = await api.patch(`/proposals/${editedItem.value.propNo}`, editedItem.value);
        if (res.status === 200) {
            triggerAlert('제안이 수정되었습니다.', 'success');
            await initialize();
            dialogEdit.value = false;
        }
    } catch (error) {
        console.error('수정 실패:', error);
        triggerAlert('제안 수정에 실패했습니다.', 'error');
    }
};

const deleteProposalApi = async () => {
    try {
        await api.delete(`/proposals/${editedItem.value.propNo}`);
        triggerAlert('제안이 삭제되었습니다.', 'success');
        setTimeout(() => router.push('/proposals'), 1500);
        proposals.value.splice(editedIndex.value, 1);
        resetForm();
        router.push('/proposals');
    } catch (error) {
        console.error('삭제 실패:', error);
        triggerAlert('제안 삭제에 실패했습니다.', 'error');
    } finally {
        showConfirmDialogs.value = false;
    }
    close();
};

const resetForm = () => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
};

const createNewProposal = () => {
    resetForm();
    router.push('/proposals/create');
};

const confirmDelete = async () => {
    await deleteProposalApi();
    // dialogDelete.value = false;
    showConfirmDialogs.value = false;
};

const deleteItem = (item) => {
    editedItem.value = { ...item };
    editedIndex.value = proposals.value.indexOf(item);
    // dialogDelete.value = true;
    showConfirmDialogs.value = true;
};

const closeDeleteDialog = () => {
    // dialogDelete.value = false;
    showConfirmDialogs.value = false;
};

const navigateToCreate = () => {
    router.push('/proposals/create');
};

const closeEditDialog = () => {
    resetForm();
    dialogEdit.value = false;
};

const save = async () => {
    if (editedIndex.value === -1) {
        await submitProposalApi();
    } else {
        await updateProposalApi();
    }
    closeEditDialog();
};

const displayedProposals = computed(() => proposals.value);

initialize();

const alertDialog = ref(false);
const successAlert = ref(false);
const errorAlert = ref(false);
const warningAlert = ref(false);
</script>

<template>
    <ConfirmDialogs :dialog="showConfirmDialogs" @agree="deleteProposalApi" @disagree="() => (showConfirmDialogs = false)" />
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
                <v-text-field color="primary" variant="outlined" type="text" placeholder="제안명" hide-details class="mb-4"></v-text-field>
                <v-text-field
                    color="primary"
                    variant="outlined"
                    type="text"
                    placeholder="영업기회명"
                    hide-details
                    class="mb-4"
                ></v-text-field>
                <v-text-field v-model="startDate" label="요청일" type="date"></v-text-field>
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
                    :headers="headers"
                    :items="displayedProposals"
                    :sort-by="[{ key: 'reqDate', order: 'asc' }]"
                    item-key="propNo"
                    show-actions
                >
                    <template v-slot:item.actions="{ item }">
                        <EditIcon height="20" width="20" class="mr-2 text-primary cursor-pointer" size="small" @click="editItem(item)" />
                        <TrashIcon height="20" width="20" class="text-error cursor-pointer" size="small" @click="deleteItem(item)" />
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialogEdit" max-width="600px">
        <v-card>
            <v-card-title>{{ formTitle }}</v-card-title>
            <v-card-text>
                <v-form>
                    <v-text-field v-model="editedItem.leadName" label="영업기회명" disabled></v-text-field>
                    <v-text-field v-model="editedItem.name" label="제안명" required></v-text-field>
                    <v-text-field v-model="editedItem.cont" label="내용"></v-text-field>
                    <v-text-field v-model="editedItem.reqDate" label="요청일" type="date"></v-text-field>
                    <v-text-field v-model="editedItem.submitDate" label="제출일" type="date"></v-text-field>
                    <v-text-field v-model="editedItem.startDate" label="제안 시작일" required type="date"></v-text-field>
                    <v-text-field v-model="editedItem.endDate" label="제안 종료일" type="date"></v-text-field>
                    <v-text-field v-model="editedItem.prDate" label="발표일" type="date"></v-text-field>
                    <v-textarea v-model="editedItem.note" label="비고" rows="2"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="outlined" style="font-size: 15px; font-weight: 600" @click="save">수정</v-btn>
                <v-btn color="close" variant="plain" style="font-size: 15px; font-weight: 600" @click="closeEditDialog">닫기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
