<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: '제안 목록' });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '제안', disabled: true, href: '#' }
]);

const dialogDelete = ref(false);
const proposals = ref([]);
const leads = ref([]);
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
    { title: '제안 시작일', key: 'startDate' },
    { title: '제안 종료일', key: 'endDate' },
    { title: '', key: 'actions', sortable: false }
]);

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
            successAlert.value = true;
            alertDialog.value = true;

            setTimeout(() => router.push('proposals'), 1500);
            await initialize();
            resetForm();
        }
    } catch (error) {
        console.error('등록 실패:', error);
        errorAlert.value = true;
        alertDialog.value = true;
    }
};

const updateProposalApi = async () => {
    try {
        const res = await api.patch(`/proposals/${editedItem.value.propNo}`, editedItem.value);
        if (res.status === 200) {
            successAlert.value = true;
            alertDialog.value = true;

            setTimeout(() => router.push('proposals'), 1500);
            await initialize();
            resetForm();
            dialogEdit.value = false;
        }
    } catch (error) {
        console.error('수정 실패:', error);
        errorAlert.value = true;
        alertDialog.value = true;
    }
};

const deleteProposalApi = async () => {
    try {
        await api.delete(`/proposals/${editedItem.value.propNo}`);
        successAlert.value = true;
        alertDialog.value = true;
        setTimeout(() => router.push('/proposals'), 1500);
        proposals.value.splice(editedIndex.value, 1);
        resetForm();
        router.push('/proposals');
    } catch (error) {
        console.error('삭제 실패:', error);
        errorAlert.value = true;
        alertDialog.value = true;
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
    dialogDelete.value = false;
};

const deleteItem = (item) => {
    editedItem.value = { ...item };
    editedIndex.value = proposals.value.indexOf(item);
    dialogDelete.value = true;
};

const closeDeleteDialog = () => {
    dialogDelete.value = false;
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
    <v-dialog v-model="alertDialog" max-width="500" class="dialog-mw">
        <v-card>
            <v-card-text>
                <v-alert v-if="successAlert" type="success" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Success</h5>
                    <div>요청이 성공적으로 완료되었습니다.</div>
                </v-alert>
                <v-alert v-if="errorAlert" type="error" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Error</h5>
                    <div>요청이 실패했습니다. 다시 시도해주세요.</div>
                </v-alert>
                <v-alert v-if="warningAlert" type="warning" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Warning</h5>
                    <div>필수 항목을 입력해주세요.</div>
                </v-alert>
            </v-card-text>
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

        <v-col cols="12" md="10">
            <UiParentCard title="제안">
                <v-data-table
                    :headers="headers"
                    :items="displayedProposals"
                    :sort-by="[{ key: 'reqDate', order: 'asc' }]"
                    item-key="propNo"
                    show-actions
                >
                    <template v-slot:top>
                        <v-toolbar class="bg-lightsecondary" flat>
                            <v-toolbar-title></v-toolbar-title>
                                <v-row justify="end">
                                    <v-col cols="auto">
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" variant="tonal" class="mr-2" @click="navigateToCreate">제안 생성</v-btn>
                                </v-col>
                            </v-row>
                        </v-toolbar>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <EditIcon
                            height="20"
                            width="20"
                            class="mr-2 text-primary cursor-pointer"
                            size="small"
                            @click="editItem(item)"
                        />
                        <TrashIcon
                            height="20"
                            width="20"
                            class="text-error cursor-pointer"
                            size="small"
                            @click="deleteItem(item)"
                        />
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <v-dialog v-model="dialogEdit" max-width="500px">
        <v-card>
            <v-card-title>{{ formTitle }}</v-card-title>
            <v-card-text>
                <v-form>
                    <v-text-field v-model="editedItem.leadName" label="영업기회명" disabled></v-text-field>
                    <v-text-field v-model="editedItem.name" label="제안명" required></v-text-field>
                    <v-text-field v-model="editedItem.cont" label="내용" required></v-text-field>
                    <v-text-field v-model="editedItem.reqDate" label="요청일" required type="date"></v-text-field>
                    <v-text-field v-model="editedItem.startDate" label="제안 시작일" required type="date"></v-text-field>
                    <v-text-field v-model="editedItem.endDate" label="제안 종료일" required type="date"></v-text-field>
                    <v-text-field v-model="editedItem.prDate" label="발표일" required type="date"></v-text-field>
                    <v-textarea v-model="editedItem.note" label="비고" rows="2"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="outlined" style="font-size: 15px; font-weight: 600;" @click="save">수정</v-btn>
                <v-btn color="close" variant="plain" style="font-size: 15px; font-weight: 600;" @click="closeEditDialog">닫기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
            <v-card-title class="text-h5 text-center py-6">선택한 제안을 정말 삭제하시겠습니까?</v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" @click="closeDeleteDialog">삭제</v-btn>
                <v-btn color="success" variant="flat" @click="confirmDelete">취소</v-btn>
                <v-spacer></v-spacer>
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
</style>