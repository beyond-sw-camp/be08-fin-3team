<script setup lang="ts">
import { ref, onMounted, watch} from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const page = ref({ title: '목표 매출 관리' });
const breadcrumbs = ref([
    {
        text: '관리자',
        disabled: false,
        href: '#'
    },
    {
        text: '목표 매출  관리',
        disabled: true,
        href: '#'
    }
]);

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const searchYear = ref('2024');
const targetSales = ref([]);
const canAddTargetSale = ref(false);
const productNames = ref([]);
const formValid = ref(false);
const isEditMode = ref(false);

const selectedDepartment = ref<string | null>();
const departmentNames = ref<{ no: number, name: string }[]>([]);
const departmentLabels = ref<string[]>([]);

const selectedSalesperson = ref<string | null>();
const salespersonNames = ref<string[]>([]);

const currentYear = new Date().getFullYear();
const yearRange = ref<number[]>([]);;

for (let i = currentYear - 2; i <= currentYear + 2; i++) {
  yearRange.value.push(i);
}

const headers = ref([
  { title: '제품 이름', align: 'start', sortable: false, key: 'prodName' },
  { title: '합계', key: 'sum' },
  { title: '01월', key: 'month01' },
  { title: '02월', key: 'month02' },
  { title: '03월', key: 'month03' },
  { title: '04월', key: 'month04' },
  { title: '05월', key: 'month05' },
  { title: '06월', key: 'month06' },
  { title: '07월', key: 'month07' },
  { title: '08월', key: 'month08' },
  { title: '09월', key: 'month09' },
  { title: '10월', key: 'month10' },
  { title: '11월', key: 'month11' },
  { title: '12월', key: 'month12' },
  { title: '', align: 'start' },
]);

async function fetchDepartments() {
    try {
        const response = await api.get('/admin/departments');

        departmentNames.value = treeDepartments(response.data.result);
        departmentLabels.value = departmentNames.value.map(dept => dept.name);

        console.log(departmentLabels);
    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

function treeDepartments(departments) {
    const names = [];
    departments.forEach(department => {
        names.push({ no: department.no, name: department.name });
        if (department.children && department.children.length > 0) {
            names.push(...treeDepartments(department.children));
        }
    });
    return names;
}

function groupDataByProduct(data) {
  const groupedData = [];
  data.forEach(item => {
    let existingProduct = groupedData.find(prod => prod.prodName === item.prodName);
    if (!existingProduct) {
      existingProduct = {
        prodName: item.prodName,
        month01: '', month02: '', month03: '', month04: '',
        month05: '', month06: '', month07: '', month08: '',
        month09: '', month10: '', month11: '', month12: '',
        sum: 0,
        isEditing: false
      };
      groupedData.push(existingProduct);
    }
    const monthKey = `month${String(item.month).padStart(2, '0')}`;
    existingProduct[monthKey] = item.monthTarget;
    existingProduct.sum += item.monthTarget;
  });
  return groupedData;
}

async function fetchUsersByDepartment(deptNo: number) {
    try {
        console.log(deptNo);

        const response = await api.get(`/users/by-dept/${deptNo}`);
        salespersonNames.value = response.data.result
            .filter(user => user.name !== "관리자")
            .map(user => user.name);

    } catch (error) {
        console.error('Error:', error.message || error);
    }
}

async function fetchProducts() {
  try {
    const response = await api.get('/admin/products');
    productNames.value = response.data.result.map(product => product.name);
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

async function fetchTargetSales() {
  try {
    const response = await api.get(`/admin/targetsales/${selectedSalesperson.value}`, {
      params: {
        year: searchYear.value,
      },
    });

    if (response.data.code === 200) {
      if (Array.isArray(response.data.result)) {
        targetSales.value = groupDataByProduct(response.data.result);
        canAddTargetSale.value = true;
        
        const existingProductNames = targetSales.value.map(item => item.prodName);
        productNames.value = productNames.value.filter(name => !existingProductNames.includes(name));
      }
    } else {
      canAddTargetSale.value = false;
      triggerAlert('년도와 영업사원을 선택해주세요.', 'warning', 2000);
      targetSales.value = [];
    }
  } catch (error) {
    console.error('Error adding target sale:', error.message || error);
  }
}
const dialog = ref(false);
const newTargetSale = ref({
  userName: '',
  prodName: '',
  sum: 0,
  year: '',
  monthTargets: Array(12).fill(0),
})

function openDialog() {
  newTargetSale.value.userName = selectedSalesperson.value;
  newTargetSale.value.year = searchYear.value;
  isEditMode.value = false;
    
  dialog.value = true;
}

async function saveTargetSale() {
  validateForm();
  if (!formValid.value) return;

  const dataToSave = {
    ...newTargetSale.value,
    sum: parseNumber(newTargetSale.value.sum),
    monthTargets: newTargetSale.value.monthTargets.map(target => parseNumber(target)),
  };
  
  try {
    const response = await api.post('/admin/targetsales', dataToSave);
    dialog.value = false;
    fetchTargetSales();
    closeDialog();
    console.log(response);
    triggerAlert('목표매출이 등록되었습니다.', 'success', 2000);
  } catch (error) {
    triggerAlert('목표매출 등록에 실패했습니다.', 'error', 2000);
  }
}


function editTargetSale(item) {
  newTargetSale.value = {
    userName: selectedSalesperson.value,
    prodName: item.prodName,
    sum: formatNumberWithCommas(item.sum),
    year: searchYear.value,
    monthTargets: [
      formatNumberWithCommas(item.month01),
      formatNumberWithCommas(item.month02),
      formatNumberWithCommas(item.month03),
      formatNumberWithCommas(item.month04),
      formatNumberWithCommas(item.month05),
      formatNumberWithCommas(item.month06),
      formatNumberWithCommas(item.month07),
      formatNumberWithCommas(item.month08),
      formatNumberWithCommas(item.month09),
      formatNumberWithCommas(item.month10),
      formatNumberWithCommas(item.month11),
      formatNumberWithCommas(item.month12),
    ],
  };
  isEditMode.value = true;
  dialog.value = true;
}


function closeDialog() {
  dialog.value = false;
  newTargetSale.value = {
    userName: '',
    prodName: '',
    sum: 0,
    year: '',
    monthTargets: Array(12).fill(0),
  };
}

function validateForm() {
  formValid.value = !!newTargetSale.value.prodName;
}

const search = () => {
  fetchTargetSales();
};

function formatNumber(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatNumberWithCommas(value) {
  if (value === null || value === undefined) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseNumber(value) {
  return parseInt(value.toString().replace(/,/g, '')) || 0;
}

watch(selectedDepartment, (newDeptName) => {
    if (newDeptName) {
        const selectedDept = departmentNames.value.find(dept => dept.name === newDeptName);
      
        selectedSalesperson.value = null;

        if (selectedDept) fetchUsersByDepartment(selectedDept.no);
    }
});

onMounted(() => {
  fetchDepartments();
  fetchProducts();
});
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="목표 매출 관리">
        <v-row class="mb-5">
          <v-col cols="3" sm="3">
            <v-select
              label="년도 선택"
              v-model="searchYear"
              :items="yearRange"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="3" sm="3">
            <v-select
              label="부서 선택"
              v-model="selectedDepartment"
              :items="departmentLabels"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="3" sm="3">
            <v-select
              v-model="selectedSalesperson"
              :items="salespersonNames"
              label="영업사원 선택"
            ></v-select>
          </v-col>
          <v-col cols="3">
            <v-btn color="primary" @click="search">검색</v-btn>
          </v-col>
          <v-col cols="12">
                <p style = "font-weight: bold;">검색 결과: {{ targetSales.length }}건, 금액(원)</p>
          </v-col>
        </v-row>

        <v-data-table
          class="border rounded-md" 
          :headers="headers"
          :items="targetSales">
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.prodName }}</td>
              <td>{{ formatNumber(item.sum) }}</td>
              <td>{{ formatNumber(item.month01) }}</td>
              <td>{{ formatNumber(item.month02) }}</td>
              <td>{{ formatNumber(item.month03) }}</td>
              <td>{{ formatNumber(item.month04) }}</td>
              <td>{{ formatNumber(item.month05) }}</td>
              <td>{{ formatNumber(item.month06) }}</td>
              <td>{{ formatNumber(item.month07) }}</td>
              <td>{{ formatNumber(item.month08) }}</td>
              <td>{{ formatNumber(item.month09) }}</td>
              <td>{{ formatNumber(item.month10) }}</td>
              <td>{{ formatNumber(item.month11) }}</td>
              <td>{{ formatNumber(item.month12) }}</td>
              <td>
                <EditIcon
                    height="20"
                    width="20"
                    class="mr-2 text-primary cursor-pointer"
                    size="small"
                    @click.stop="editTargetSale(item)"
                />
              </td>
            </tr>
          </template>
          <template v-slot:top>
            <v-toolbar class="bg-lightsecondary" flat>
              <v-toolbar-title>목표 매출</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn 
                class="mr-3"
                v-if="canAddTargetSale" 
                color="primary" 
                variant="tonal" 
                dark 
                @click.stop="openDialog">
                목표 매출 생성
              </v-btn>
            </v-toolbar>
          </template>
        </v-data-table>
      </UiParentCard>
    </v-col>
  </v-row>

  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>{{ isEditMode ? '목표매출 수정' : '목표매출 등록' }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-form v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newTargetSale.prodName"
                  :items="productNames"
                  label="제품 이름"
                  :rules="[v => !!v || '상품명은 필수 입력입니다.']"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  v-model="newTargetSale.sum" 
                  label="합계" 
                  type="text" 
                  @input="newTargetSale.sum = formatNumberWithCommas(parseNumber(newTargetSale.sum))"
                  :rules="[v => /^(?!.*,,)[0-9]*(,[0-9]+)*$/.test(v)|| '숫자만 입력하세요']"
                />
              </v-col>
              <v-col cols="4" v-for="(month, index) in 12" :key="index">
                <v-text-field 
                  v-model="newTargetSale.monthTargets[index]" 
                  :label="`${index + 1}월`" 
                  type="text"
                  @input="newTargetSale.monthTargets[index] = formatNumberWithCommas(parseNumber(newTargetSale.monthTargets[index]))"
                  :rules="[v => /^(?!.*,,)[0-9]*(,[0-9]+)*$/.test(v)|| '숫자만 입력하세요']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" flat style="font-size: 15px; font-weight: 600;" @click="saveTargetSale()" :disabled="!formValid">저장</v-btn>
        <v-btn color="close" flat style="font-size: 15px; font-weight: 600;" @click="closeDialog">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
