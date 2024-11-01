<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12">
      <v-row justify="end" class="mr-3">
        <v-btn color="primary" variant="tonal" @click="openAddModal">할 일 생성</v-btn>
      </v-row>
      </v-col>
      <v-col cols="12">
      <v-data-table
        :headers="headers"
        :items="tasks"
        item-value="name"
        :group-by="groupBy"
        :sort-by="sortBy"
        items-per-page="-1"
      >
        <template v-slot:[`item.name`]="{ item }">
          <div>{{ item.name }}</div>
        </template>
        <template v-slot:[`item.priority`]="{ item }">
          <div>{{ item.priority }}</div>
        </template>
        <template v-slot:[`item.dueDate`]="{ item }">
          <div>{{ item.dueDate }}</div>
        </template>
        <template v-slot:[`item.content`]="{ item }">
          <div>{{ item.content }}</div>
        </template>
      </v-data-table>

      <TodoModal
        v-model="showAddModal"
        :todo="todo"
        :statusOptions="['진행 전', '진행 중', '완료']"
        :priorityOptions="['높음', '중간', '낮음']"
        @add="addTask"
        @close="closeModal" @delete="deleteTodo" @update="updateTodo"
      />

      <v-alert v-if="showSuccessAlert" type="success" variant="tonal" :class="['alert', alertType]">
        <h5 class="text-h6 text-capitalize">Success</h5>
        {{ alertMessage }}
      </v-alert>
      <v-alert v-if="showErrorAlert" type="error" variant="tonal" :class="['alert', alertType]">
        <h5 class="text-h6 text-capitalize">Error</h5>
        {{ alertMessage }}
      </v-alert>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useTaskStore } from '@/stores/apps/todo/tasktodo';
import TodoModal from '@/components/modal/TodoModal.vue';
import api from '@/api/axiosinterceptor';

const page = ref({ title: '할 일 목록' });
const breadcrumbs = ref([
  { text: '일정관리', disabled: false, href: '#' },
  { text: '할 일', disabled: true, href: '#' }
]);

const sortBy = ref([{ key: 'dueDate', order: 'asc' }]);
const groupBy = ref([{ key: 'status', order: 'desc' }]);

const todo = ref({
  calendarNo: null,
  title: '',
  todoCls: '',
  priority: '',
  dueDate: '',
  status: '',
  privateYn: 'Y',
  content: ''
});

const taskStore = useTaskStore();
const tasks = ref([]);
const showAddModal = ref(false);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const alertMessage = ref('');

const getCalendarNo = async () => {
  try {
    const response = await api.get('/calendars/user/data');
    todo.value.calendarNo = response.data.result.calendarNo;
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  await taskStore.fetchTasks();
  tasks.value = taskStore.tasks;
  await getCalendarNo();
});

const headers = [
  { text: '우선순위', value: 'priority' },
  { text: '이름', value: 'name' },
  { text: '카테고리', value: 'category' },
  { text: '내용', value: 'content' },
  { text: '마감일', value: 'dueDate' },
];

function clearTodoForm() {
  todo.value = ref({
    calendarNo: todo.value.calendarNo,
    title: '',
    todoCls: '',
    priority: '',
    dueDate: '',
    status: '',
    privateYn: 'Y',
    content: ''
  });
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal(){
  showAddModal.value = false;
  setTimeout(() => {
    clearTodoForm();
  }, 300);
}

async function addTask() {
  const statusMapping = {
    '진행 전': 'TODO',
    '진행 중': 'INPROGRESS',
    '완료': 'DONE'
  };
  
  try {
    const response = await api.post('/todos', {
      calendarNo: todo.value.calendarNo,
      title: todo.value.title,
      todoCls: todo.value.todoCls,
      priority: todo.value.priority,
      dueDate: todo.value.dueDate,
      status: statusMapping[todo.value.status] || todo.value.status,
      privateYn: todo.value.privateYn,
      content: todo.value.content
    });

    console.log(response)
    if (response.data.isSuccess) {
      tasks.value.push({ ...todo.value });
      showAddModal.value = false;
      handleAlert({
        message: '할 일이 추가되었습니다.',
        type: 'success'
      });
    }
  } catch (error) {
    console.error(error);
  }
  closeModal()
}

function handleAlert(alertData) {
  alertMessage.value = alertData.message;
  if (alertData.type === 'success') {
    showSuccessAlert.value = true;
    setTimeout(() => {
      showSuccessAlert.value = false;
      showAddModal.value = false;
    }, 2000);
  } else if (alertData.type === 'error') {
    showErrorAlert.value = true;
    setTimeout(() => {
      showErrorAlert.value = false;
    }, 2000);
  }
}
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20%;
  left: 90%;
  transform: translateX(-50%);
  z-index: 3000;
  width: 100%;
  max-width: 17%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 15px;
}
</style>
