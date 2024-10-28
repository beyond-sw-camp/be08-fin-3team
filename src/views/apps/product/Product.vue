<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import api from '@/api/axiosinterceptor';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';

import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const dialog = ref(false);
// const dialogDelete = ref(false);
const showConfirmDialog = ref(false);
const formValid = ref(false);
const departmentNames = ref([]);
const searchProdName = ref('');

const headers = ref([
    { title: '제품 코드', key: 'prodCode' },
    { title: '제품명', key: 'name' },
    { title: '영문 제품명', key: 'engName' },
    { title: '제품 약명', key: 'abbrName' },
    { title: '출시일', key: 'releaseDate' },
    { title: '부서', key: 'dept' },
    { title: '포장 수량', key: 'quantity' },
    { title: '포장 단위', key: 'unit' },
    { title: '규격', key: 'field' },
    { title: '원가', key: 'supplyPrice' },
    { title: '세율', key: 'taxRate' },
    { title: '가격', key: 'price' },
    { title: '', key: 'actions'},
]);

const items = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
    prodNo: 0,
    prodCode: '',
    name: '',
    engName: '',
    abbrName: '',
    releaseDate: '',
    dept: '',
    quantity: 0,
    unit: '',
    field: '',
    supplyPrice: 0,
    taxRate: 0,
    price: 0,
});
const defaultItem = ref({
    prodNo: 0,
    prodCode: '',
    name: '',
    engName: '',
    abbrName: '',
    releaseDate: '',
    dept: '',
    quantity: 0,
    unit: '',
    field: '',
    supplyPrice: 0,
    taxRate: 0,
    price: 0,
});

async function fetchDepartments(){
    try{
        const response = await api.get('/admin/departments')
        console.log(response);

        departmentNames.value = response.data.result.map(department => department.name);

        console.log(departmentNames.value);
    }catch{
        console.error('Error:', error.message || error);
    }
}

async function fetchProducts() {
    try {
        const response = await api.get('/admin/products');
        items.value = response.data.result;
    } catch (error) {
        console.error('제품 정보를 가져오는 중 오류 발생:', error);
    }
}

async function search() {
    if (!searchProdName.value) {
            await fetchProducts();
            return;
    }
    try {
        const response = await api.get(`/admin/products/${searchProdName.value}`);
        
        if (Array.isArray(response.data.result)) {
            items.value = response.data.result;
        } else if (typeof response.data.result === 'object' && response.data.result !== null) {
            items.value = [response.data.result];
        } else {
            console.error('Unexpected data format:', response.data.result);
            items.value = [];
        }
    } catch (error) {
        console.error('제품 정보를 가져오는 중 오류 발생:', error);
    }
}


function initialize() {
    editedItem.value = Object.assign({}, defaultItem.value);
    fetchProducts();
    fetchDepartments();

}

const formTitle = computed(() => (editedIndex.value === -1 ? '제품 등록' : '제품 수정'));

function editItem(item) {
    editedIndex.value = items.value.indexOf(item);
    editedItem.value = Object.assign({}, item);
    dialog.value = true;
}

function deleteItem(item) {
    editedIndex.value = items.value.indexOf(item);
    editedItem.value = Object.assign({}, item);
    // dialogDelete.value = true;
    showConfirmDialog.value = true;
}

async function save() {
    if (formValid.value) {
        try {
            if (editedIndex.value > -1) {
                await api.patch(`/admin/products/${editedItem.value.prodNo}`, editedItem.value);
                Object.assign(items.value[editedIndex.value], editedItem.value);
                triggerAlert('제품이 수정되었습니다.', 'success', 2000);
            } else {
                const response = await api.post('/admin/products', editedItem.value);
                items.value.push(response.data.result);
                triggerAlert('제품이 등록되었습니다.', 'success', 2000);
            }
            fetchProducts();
            close();
        } catch (error) {
            console.error('저장 중 오류 발생:', error);
            triggerAlert('제품 등록에  실패했습니다.', 'error', 2000);
        }
    }
}

async function deleteItemConfirm() {
    try {
        const apiUrl = `/admin/products/${editedItem.value.prodNo}`;
        await api.delete(apiUrl);
        items.value.splice(editedIndex.value, 1);
        triggerAlert('제품이 삭제되었습니다.', 'success', 2000);
        closeDelete();
    } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        triggerAlert('제품 삭제에 실패했습니다.', 'error', 2000);
    }
}

function close() {
    dialog.value = false;
    nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
    });
}

function closeDelete() {
    // dialogDelete.value = false;
    showConfirmDialog.value = false;
    nextTick(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
    });
}

// watch(dialog, (val) => {
//     if (!val) close();
// });
// watch(dialogDelete, (val) => {
//     if (!val) closeDelete();
// });

initialize();
</script>

<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <UiParentCard title="관리 제품 목록">
        <v-row class="mb-5">
            <v-col cols="4" sm="4">
                <v-text-field v-model="searchProdName"
                            :items="userNames"
                            label="제품명을 입력하세요."></v-text-field>
            </v-col>
            <v-col cols="4">
                <v-btn color="primary" @click="search">검색</v-btn>
            </v-col>
        </v-row>
        <v-data-table
            class="border rounded-md"
            :headers="headers"
            :items="items"
            :sort-by="[{ value: 'prodCode', order: 'asc' }]"
        >
            <template v-slot:top>
                <v-toolbar class="bg-lightsecondary" flat>
                    <v-toolbar-title>제품 목록</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="600px">
                        <template v-slot:activator="{ props }">
                            <v-btn class="mr-2" color="primary" variant="tonal" v-bind="props">제품 생성</v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container class="px-0">
                                    <v-form v-model="formValid">
                                        <v-row>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.prodCode" label="제품 코드" :rules="[v => !!v || '제품 코드는 필수 입력입니다.']" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.name" label="제품명" :rules="[v => !!v || '제품 이름은 필수 입력입니다.']" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.engName" label="영문 제품명"
                                                    :rules="[
                                                        v => !!v || '영문 제품명은 필수 입력입니다.',
                                                        v => /^[a-zA-Z\s]+$/.test(v) || '영문만 입력하세요'
                                                    ]" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.abbrName" label="제품 약명" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.releaseDate" variant="outlined" hide-details type="date" required label="출시일"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-select
                                                    v-model="editedItem.dept"
                                                    :items="departmentNames"
                                                    label="부서명"
                                                ></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.quantity" label="포장 수량" :rules="[v => /^[0-9]+$/.test(v) || '숫자만 입력하세요']" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.unit" label="포장 단위" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.field" label="규격" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.supplyPrice" label="원가" :rules="[v => /^[0-9]+$/.test(v) || '숫자만 입력하세요']" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.taxRate" label="세율" :rules="[v => /^[0-9]+$/.test(v) || '숫자만 입력하세요']" required></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4">
                                                <v-text-field v-model="editedItem.price" label="가격"
                                                    :rules="[
                                                            v => !!v || '가격은 필수 입력입니다.',
                                                            v => /^[0-9]+$/.test(v) || '숫자만 입력하세요'
                                                        ]"
                                                    required>
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn flat style="font-size: 15px; font-weight: 600;" color="primary" @click="save" :disabled="!formValid">저장</v-btn>
                                <v-btn color="close" flat style="font-size: 15px; font-weight: 600;"  @click="close">닫기</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDelete" max-width="400px">
                        <v-card>
                            <v-card-title class="text-h5">Delete Confirmation</v-card-title>
                            <v-card-text>Are you sure you want to delete this item?</v-card-text>
                            <v-card-actions>
                                <v-btn color="error" @click="deleteItemConfirm">Delete</v-btn>
                                <v-btn @click="closeDelete">Cancel</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
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
        <ConfirmDialogs :dialog="showConfirmDialog" @agree="deleteItemConfirm" @disagree="closeDelete"
        />
    </UiParentCard>
</template>
