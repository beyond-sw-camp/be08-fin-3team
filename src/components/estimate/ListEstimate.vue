<script setup>
import { computed, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
const showConfirmDialogs = ref(false); // 열림 상태 관리

const page = ref({ title: '' });

const dialogDelete = ref(false);
const estimates = ref([]);
const dialogEdit = ref(false);
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
    router.push(`/estimates/form/${estNo}`);
};

async function initialize() {
    try {
        const response = await api.get('/estimates');
        estimates.value = response.data.result.map((estimate) => {
            const firstProduct = estimate.estProducts && estimate.estProducts.length > 0 ? estimate.estProducts[0] : {};
            return {
                ...estimate,
                estProdNo: firstProduct.estProdNo || null,
                prodName: firstProduct.prodName || '없음'
            };
        });

        console.log(estimates.value);
    } catch (error) {
        console.error('Failed to fetch estimates:', error);
    }
}

const navigateToCreate = () => {
    router.push('/estimates/create');
};

const displayedEstimates = computed(() => estimates.value);

const deleteEstimateApi = async () => {
    try {
        await api.delete(`/estimates/${editedItem.value.estNo}`);

        successAlert.value = true;
        alertDialog.value = true;

        setTimeout(() => router.push('/estimates'), 1500);

        estimates.value.splice(editedIndex.value, 1);
        resetForm();
        router.push('/estimates');
    } catch (error) {
        errorAlert.value = true;
        alertDialog.value = true;
    }
};

const resetForm = () => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
};

const deleteItem = (item) => {
    editedItem.value = { ...item };
    editedIndex.value = estimates.value.indexOf(item);
    // dialogDelete.value = true;
    showConfirmDialogs.value = true;
};

const confirmDelete = async () => {
    await deleteEstimateApi();
    // dialogDelete.value = false;
    showConfirmDialogs.value = false;
};

const closeDeleteDialog = () => {
    // dialogDelete.value = false;
    showConfirmDialogs.value = false;
};

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
                    <div>견적이 성공적으로 삭제되었습니다.</div>
                </v-alert>
                <v-alert v-if="errorAlert" type="error" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Error</h5>
                    <div>견적 삭제에 실패했습니다. 다시 시도해주세요.</div>
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
                <v-text-field color="primary" variant="outlined" type="text" placeholder="견적명" hide-details class="mb-4"></v-text-field>
                <v-text-field color="primary" variant="outlined" type="text" placeholder="제안명" hide-details class="mb-4"></v-text-field>
                <v-select
                    v-model="selectedStatus"
                    :items="statuses"
                    item-props="true"
                    item-title="text"
                    item-value="value"
                    label="제안서"
                    class="mt-4"
                ></v-select>
                <v-text-field v-model="startDate" label="견적일" type="date"></v-text-field>
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
                        <v-card-title class="mb-0">검색결과: {{ dataSize }}건</v-card-title>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="auto">
                        <v-btn color="primary" variant="flat" class="mr-2" @click="navigateToCreate">견적 생성</v-btn>
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
                    <template v-slot:item.actions="{ item }">
                        <EditIcon
                            height="20"
                            width="20"
                            class="mr-2 text-primary cursor-pointer"
                            size="small"
                            @click="goToDetailEstimate(item.estNo)"
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
</style>
