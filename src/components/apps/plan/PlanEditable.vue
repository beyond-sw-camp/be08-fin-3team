<script setup>
import { ref, computed, onMounted } from 'vue';
import { PencilIcon, TrashIcon } from 'vue-tabler-icons';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import PlanModal from '@/components/modal/PlanModal.vue';
import api from '@/api/axiosinterceptor';
import { chipColors, reversePlanCls, categoryColors } from '@/utils/PlanMappings';
import {useCalendarUserStore} from '@/stores/apps/calendar/calendarStore';

const calendarStore = useCalendarUserStore();
const userCalendarNo = localStorage.getItem('calendarNo');

const plans = ref([]);
const search = ref('');
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const showSuccessAlert = ref(false);
const alertMessage = ref('');
const AddPlanModal = ref(false);
const editedItem = ref({
    calendarNo: null,
    personalYn: '',
    planCls: '',
    planDate: '',
    title: '',
    startTime: '',
    endTime: '',
    content: ''
});
const defaultItem = ref({
    personalYn: '',
    planCls: '',
    planDate: '',
    title: '',
    startTime: '',
    endTime: '',
    content: ''
});
const planClsOptions = ['개인', '전사', '제안', '견적', '매출', '계약'];
const mode = ref('add');
const totalPlansCount = computed(() => plans.value.length);
const headers = ref([
  { title: '번호', key: 'planNo'},
  { title: '제목', key: 'title'},
  { title: '날짜', key: 'planDate'},
  { title: '분류', key: 'planCls'},
  { title: '시간', key: 'startTime'},
  { title: '', key: 'actions', sortable: false }
]);

function handleShowAlert(event) {
    showSuccessAlert.value = true;
    alertMessage.value = event.message;
    setTimeout(() => showSuccessAlert.value = false, 2000);
}

async function fetchPlans() {
    try {
        const response = await api.get('/plans');
        console.log(response);
        if (response.data.code===200) {
            plans.value = response.data.result.filter((plan) => plan.calendarNo === Number(userCalendarNo));
            // plans.value = response.data.result;
        } else {
            console.error('데이터 불러오기 실패:', response.data.message);
        }
    } catch (error) {
        console.error('API 요청 오류:', error);
    }
}

onMounted(() => {
// getCalendarNo();
    fetchPlans();
});

// const getCalendarNo = async () => {
// 			try {
//         const response = await api.get('/calendars/user/data');
//         editedItem.value.calendarNo = response.data.result.calendarNo;
//       } catch (e) {
//         console.error(e);
//       }
//     };

// 검색 필터링
const filteredList = computed(() => {
    return plans.value.filter((plan) => {
        return plan.title.toLowerCase().includes(search.value.toLowerCase());
    });
});

function editItem(item) {
    editedIndex.value = plans.value.indexOf(item);
    editedItem.value = {
        ...item,
        planCls: reversePlanCls[item.planCls] || item.planCls
    };
    mode.value = 'edit';
    AddPlanModal.value = true;
    setTimeout(() => {
        this.$refs.planModal.fetchDomainDetails();
    }, 0);
}

function openAddPlanModal() {
    mode.value = 'add';
    editedItem.value = Object.assign({}, defaultItem.value, { calendarNo: editedItem.value.calendarNo });
    AddPlanModal.value = true;
}

async function addPlan(newPlan) {
	const { planNo, ...planData } = newPlan;
    console.log('calendarNo 확인:', planData.calendarNo); 
    try {
        const response = await api.post('/plans', planData);
        console.log('plan,response',response);
        if (response.data.isSuccess) {
            fetchPlans();
            plans.value.push(response.data.result);
            AddPlanModal.value = false;
        } else {
            console.error('일정 추가 실패:', response.data.message);
        }
    } catch (error) {
        console.error('일정 추가 오류:', error);
    }
}

async function updatePlan(updatedPlan) {
    try {
        const response = await api.patch(`/plans/${updatedPlan.planNo}`, updatedPlan);
        if (response.data.isSuccess) {
            const index = plans.value.findIndex(plan => plan.planNo === updatedPlan.planNo);
            if (index !== -1) {
                plans.value[index] = response.data.result;
            }
            AddPlanModal.value = false;
        } else {
            console.error('일정 수정 실패:', response.data.message);
        }
    } catch (error) {
        console.error('일정 수정 오류:', error);
    }
}

function deleteItem(item) {
    editedItem.value = item;
    dialogDelete.value = true;
}

async function confirmDelete() {
    if (editedItem.value.planNo) {
        try {
            await api.delete(`/plans/${editedItem.value.planNo}`);
            plans.value = plans.value.filter(plan => plan.planNo !== editedItem.value.planNo);
            dialogDelete.value = false;
        } catch (error) {
            console.error('삭제 실패:', error);
        }
    }
}

function cancelDelete() {
    dialogDelete.value = false;
}

function closePlanModal() {
    AddPlanModal.value = false;
}
</script>


<template>
  <v-alert v-if="showSuccessAlert" type="success" variant="tonal" class="success-alert">
    <h5 class="text-h5 text-capitalize">Success</h5>
    {{ alertMessage }}
  </v-alert>

  <v-row>
      <v-col cols="12" lg="4" md="6">
          <v-text-field density="compact" v-model="search" label="일정 검색" hide-details variant="outlined"></v-text-field>
      </v-col>
      <v-col cols="12" lg="8" md="6" class="text-right">
          <v-btn variant="tonal" color="primary" flat class="ml-auto" @click="openAddPlanModal">
            일정 생성
          </v-btn>
      </v-col>
  </v-row>

  <PlanModal
      v-model="AddPlanModal"
      :plan="editedItem"
      :planClsOptions="planClsOptions"
      :mode="mode"
      @close="closePlanModal"
      @add="addPlan"
      @update="updatePlan"
      @delete="deleteItem"
      @show-alert="handleShowAlert"
  />

  <v-data-table
    :headers="headers"
    :items="filteredList"
    item-value="planNo"
    class="mt-5"
    :sort-by="sortBy"
    :sort-desc.sync="sortDesc"
  >
    <template v-slot:footer.prepend>
        <div>
          <span class="mb-0 custom-title"> 전체 개수: {{ totalPlansCount }} 개</span>
        </div>
    </template>
    <template v-slot:item.planNo="{ item }">
      <span>{{ item.planNo }}</span>
    </template>

    <template v-slot:item.title="{ item }">
      <span>{{ item.title }}</span>
    </template>

    <template v-slot:item.planDate="{ item }">
      <span>{{ item.planDate }}</span>
    </template>

    <template v-slot:item.planCls="{ item }">
      <v-chip 
        :color="chipColors[item.planCls]?.color" 
        :text-color="chipColors[item.planCls]?.text"
        size="small" 
        label>
        {{ reversePlanCls[item.planCls] || item.planCls }}
      </v-chip>
    </template>

    <template v-slot:item.startTime="{ item }">
      <span>{{ item.startTime }} - {{ item.endTime }}</span>
    </template>

    <template v-slot:item.actions="{ item }">
      <div class="d-flex align-center">
        <v-tooltip text="수정">
          <template v-slot:activator="{ props }">
            <v-btn icon flat @click="editItem(item)" v-bind="props">
              <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="삭제">
          <template v-slot:activator="{ props }">
            <v-btn icon flat @click="deleteItem(item)" v-bind="props">
              <TrashIcon stroke-width="1.5" size="20" class="text-error" />
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-data-table>

  <ConfirmDialogs :dialog="dialogDelete" @agree="confirmDelete" @disagree="cancelDelete" />
</template>

<style scoped>
.success-alert {
  position: fixed;
  top: 20%;
  left: 90%;
  transform: translateX(-50%);
  z-index: 3000;
  width: 100%;
  max-width: 14%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}
.custom-title {
    font-size: 14px;
    color: rgb(201, 198, 198);
}
</style>