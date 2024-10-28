<script setup>
import { computed, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';

const page = ref({ title: '견적 목록' });

const breadcrumbs = ref([
{
	text: '영업관리',
	disabled: false,
	to: '#'
},
{
	text: '견적',
	disabled: true,
	to: ''
	},
]);
const dialogDelete = ref(false);
const estimates = ref([]);
const proposals = ref([]);
const estProducts = ref([]);
const products = ref([]);
const dialogEdit = ref(false);
const editedIndex = ref(-1);

const defaultItem = {
    estNo: null,
    propNo: null,
    propName: '',
    prodCode: null,
    prodName: '',
    name: '',
    estDate: '',
    taxCls: '',
    surtaxYn: '',
    prodCnt: 0,
    supplyPrice: 0,
    tax: 0, 
    totalPrice: 0,
    note: '',
};

const editedItem = ref({ ...defaultItem.value });

const editItem = (item) => {
  if (item) {
    console.log(item.prodName); 
    editedItem.value = {
      estNo: item.estNo,
      propNo: item.propNo,
      propName: item.propName,
      prodCode: item.prodCode,
      prodName: item.prodName,
      name: item.name,
      estDate: item.estDate,
      taxCls: item.taxCls,
      surtaxYn: item.surtaxYn,
      prodCnt: item.prodCnt,
      supplyPrice: item.supplyPrice,
      tax: item.tax,
      totalPrice: item.totalPrice,
      note: item.note,
    };
    editedIndex.value = estimates.value.indexOf(item);
    dialogEdit.value = true;
  }
};

const headers = ref([
    { title: '견적명', key: 'name' },
    { title: '제안명', key: 'propName'},
    { title: '견적일', key: 'estDate' },
    { title: '과세구분', key: 'taxCls' },
    { title: '공급가액', key: 'supplyPrice' },
    { title: '세액', key: 'tax' },
    { title: '합계금액', key: 'totalPrice' },
    { title: '', key: 'actions', sortable: false },
]);

const formTitle = computed(() => (editedIndex.value === -1 ? '견적 추가' : '견적 수정'));

const router = useRouter();

async function initialize() {
    try {
        const response = await api.get('/estimates');
        estimates.value = response.data.result;

        console.log(estimates.value);

    } catch (error) {
        console.error('Failed to fetch estimates:', error);
    }
}

const submitEstimateApi = async () => {
  try {
    const res = await api.post('/estimates', editedItem.value);
    console.log(res);
    if (res.status === 200) {
      alert("견적이 성공적으로 등록되었습니다.");
      await initialize(); 
      resetForm();
      router.push('/estimates');
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert("견적 등록에 실패했습니다.");
  }
};

const updateEstimateApi = async () => {
    try {
        const res = await api.patch(`/estimates/${editedItem.value.estNo}`, editedItem.value);
        if (res.status === 200) {
            alert("견적이 성공적으로 수정되었습니다.");
            // Object.assign(estimates.value[editedIndex.value], res.data);
            await initialize();
            resetForm();
            router.push('/estimates');
            dialogEdit.value = false;
        }
    } catch (error) {
        console.error("수정 실패:", error);
        alert("견적 수정에 실패했습니다.");
    }
};

const save = async () => {
  if (editedIndex.value === -1) {
    await submitEstimateApi();
  } else {
    await updateEstimateApi();
  }
  closeEditDialog();

}

const closeEditDialog = () => {
  resetForm();
  dialogEdit.value = false;
}

const navigateToCreate = () => {
    router.push('/estimates/create');
};

const displayedEstimates = computed(() => estimates.value);

const deleteEstimateApi = async () => {
    try {
        await api.delete(`/estimates/${editedItem.value.estNo}`);
        alert("견적이 성공적으로 삭제되었습니다.");
        estimates.value.splice(editedIndex.value, 1);
        resetForm();
        router.push('/estimates');
    } catch (error) {
        console.error("삭제 실패:", error);
        alert("견적 삭제에 실패했습니다.");
    }
};

const resetForm = () => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
};

const createNewEstimate = () => {
    resetForm();
    router.push('/estimates/create');
};


const deleteItem = (item) => {
    editedItem.value = { ...item };
    editedIndex.value = estimates.value.indexOf(item);
    dialogDelete.value = true;
};

const confirmDelete = async () => {
    await deleteEstimateApi();
    dialogDelete.value = false;
};

const closeDeleteDialog = () => {
    dialogDelete.value = false;
};

initialize();

</script>

<template>
  <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
      <v-col cols="12">
        <UiParentCard title="견적">
          <v-data-table
            class="border rounded-mid"
            :headers="headers"
            :items="displayedEstimates"
            :sort-by="[{ key: 'estDate', order: 'asc' }]"
            item-key="estNo"
            show-actions
          >
          <template v-slot:top>
              <v-row justify="end">
                <v-col cols="auto">
                <v-spacer></v-spacer>
                <v-btn color="primary" class="mr-3 mt-4" variant="tonal" @click="navigateToCreate">견적 생성</v-btn>
              </v-col>
              </v-row>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-icon
                color="info"
                size="small"
                class="me-2"
                @click="editItem(item)"
                role="button"
                aria-label="Edit Estimate"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                color="error"
                size="small"
                @click="deleteItem(item)"
                role="button"
                aria-label="Delete Estimate"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </UiParentCard>
      </v-col>
    </v-row>
  
    <!-- 수정 -->
    <v-dialog v-model="dialogEdit" max-width="500px">
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="editedItem.name" label="견적명" required></v-text-field>
            <v-text-field v-model="editedItem.propName" label="제안명" disabled></v-text-field>
            <v-text-field v-model="editedItem.prodName" label="제품명" disabled></v-text-field>
            <v-text-field v-model="editedItem.taxCls" label="과세구분" required></v-text-field>
            <v-text-field v-model="editedItem.surtaxYn" label="단가구분" required></v-text-field>
            <v-text-field v-model="editedItem.prodCnt" label="수량" required></v-text-field>
            <v-text-field v-model="editedItem.tax" label="세액" required></v-text-field>
            <v-text-field v-model="editedItem.totalPrice" label="합계금액" required></v-text-field>
            <v-textarea v-model="editedItem.note" label="비고" row="2"></v-textarea>
          </v-form>
        </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="outlined" style="font-size: 15px; font-weight: 600;" @click="save">수정</v-btn>
        <v-btn color="close" variant="flat" style="font-size: 15px; font-weight: 600;" @click="closeEditDialog">닫기</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>

    <!-- 삭제 -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 text-center py-6">선택한 견적을 정말 삭제하시겠습니까?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning" variant="flat" @click="closeDeleteDialog">취소</v-btn>
          <v-btn color="success" variant="flat" @click="confirmDelete">삭제</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  