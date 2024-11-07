<script>
import { defineComponent, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import TodoModal from '@/components/modal/TodoModal.vue';
import PlanModal from '@/components/modal/PlanModal.vue';
import './calendar.css';
import { useCalendarFilterStore } from '@/stores/apps/calendar/calendarFilterStore';
import { useCalendarUserStore } from '@/stores/apps/calendar/calendarStore';
import api from '@/api/axiosinterceptor';
import { reverseActStatus, actStatus } from '@/utils/ActStatusMappings';
import {categoryMapping, reversePlanCls} from '@/utils/PlanMappings'

export default defineComponent({
  components: {
    FullCalendar,
    TodoModal,
    PlanModal,
  },
  data() {
    return {
      AddTodoModal: false,
      AddPlanModal: false,
      selectedOption: null,
      showSuccessAlert: false,
      alertMessage: '',
      alertType: '',
      items: ['할 일', '영업활동', '일정'],
      showAlert: false,
      statusOptions: ['TODO', 'INPROGRESS', 'DONE'],
      priorityOptions: ['높음', '중간', '낮음'],
      planClsOptions: ['개인', '전사', '제안', '견적','매출', '계약'],
      showCompanyEvents: false, // 전사일정 토글 상태
      todo: {
        calendarNo: null,
        title: '',
        todoCls: '',
        priority: '',
        dueDate: '',
        status: '',
        privateYn: 'Y',
        content: '',
      },
      plan: {
        calendarNo: null,
        title: '',
        planCls: '',
        planDate: '',
        startTime: '',
        endTime: '',
        personalYn: 'Y',
        content: '',
        domainNo:'',
        planDetails : {
          title: '',
          note: '',
        },
      },
      currentUserCalendarNo: null,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        initialView: 'dayGridMonth',
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        events: this.currentEvents, 
      },
      currentEvents: [],
    };
  },
  created() {
    const alertMessage = localStorage.getItem('showAlertAfterReload');
    if (alertMessage) {
      setTimeout(() => {
        this.handleAlert({
          message: alertMessage,
          type: 'success',
        });
        localStorage.removeItem('showAlertAfterReload');
      }, 200);
    }
    this.checkCalendarExists();
    const store = useCalendarFilterStore();
    const companyCalendarStore = useCalendarUserStore();
    
    watch(() => store.filteredData, (newEvents) => {
      this.applyFilter(newEvents);
    }, { deep: true });

    // 전사일정 반영
    watch(
      () => companyCalendarStore.events,
      (newEvents) => {
        this.currentEvents = newEvents;
        this.updateCalendarEvents();
      },
      { immediate: true }
    );

    watch(
      () => this.showCompanyEvents,
      async (newVal) => {
        companyCalendarStore.showCompanyEvents = newVal;
        if (newVal) {
          await companyCalendarStore.fetchCompanyEvents();
        } else {
          await this.fetchCalendarData();
        }
      }
    );
  },

  methods: {
    async checkCalendarExists(){
      try{
        const response = await api.get('/calendars/user/exists');
        console.log(response);
        if(response.data.result){
          await this.fetchCalendarData();
        }else{
          await this.createCalendar();
        }   
      }catch(e){
        console.log(e);
      }
    },

    // 새로운 캘린더 생성
    async createCalendar() {
      try {
        const response = await api.post('/calendars');
        console.log("캘린더 생성")
        console.log(response);
      } catch (e) {
        console.error(e);
      }
    },

    // 필터
    applyFilter(filteredEvents) {
      const calendarApi = this.$refs.calendar.getApi();
      calendarApi.removeAllEvents();

      filteredEvents.forEach(event => {
        const category = this.mapPlanClsToCategory(event.planCls);
        calendarApi.addEvent({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          classNames: [event.category + '-event'],
        });
      });
    },
    
    mapPlanClsToCategory(planCls) {
      return categoryMapping[planCls] || 'plan'; 
    },
    // 전사일정 관련 업데이트 
    updateCalendarEvents() {
      this.calendarOptions.events = this.currentEvents.map(event => ({
        ...event,
        classNames: event.classNames || [event.category + '-event'],
        eventClick: this.handleEventClick,
      }));
    },

    // 조회
    async fetchCalendarData() {
      try {
        const response = await api.get('/calendars/user/data');
        const data = response.data;
        this.currentUserCalendarNo = response.data.result.calendarNo;
        // console.log("캘린더 조회")
        // console.log(response);
        if(data.code== 200){
          const calendarData = response.data.result;
          this.calendarNo = response.data.result.calendarNo;
          const store = useCalendarFilterStore();

          const todos = calendarData.todos.map(todo => ({
          id: todo.todoNo,
          title: todo.title,
          start: todo.dueDate,
          category: 'todo',
          status: todo.status,
          allDay: true,
        }));

        const plans = calendarData.plans.map(plan => ({
          id: plan.planNo,
          title: plan.title,
          start: `${plan.planDate}T${plan.startTime}`,
          end: `${plan.planDate}T${plan.endTime}`,
          category: this.mapPlanClsToCategory(plan.planCls),
          classNames: [`${plan.planCls.toLowerCase()}_plan-event`],
          allDay: false,
        }));

        const acts = calendarData.acts.map(act => ({
          id: act.actNo,
          title: act.name,
          start: `${act.actDate}T${act.startTime}`,
          end: `${act.actDate}T${act.endTime}`,
          category: 'act',
          allDay: false,
          classNames: ['act-event'],
        }));
        store.setCalendarData([...todos, ...plans, ...acts]);
        this.applyFilter(store.filteredData);

        }
      } catch (e) {
        console.error(e);
      }
    }, 
    // 추가
    async addTodo() {
      if (!this.todo.title || !this.todo.todoCls || !this.todo.priority || !this.todo.dueDate || !this.todo.status) {
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        }, 2000);
        return;
      }

      this.mode = 'add';
      this.showAlert = false;
      const setPrivateYn = {
        ...this.todo,
        calendarNo: this.calendarNo,
        privateYn: this.todo.privateYn ? 'Y' : 'N',
      };

      try {
        const response = await api.post('/todos', setPrivateYn);
        const createdTodo = response.data.result;
        const calendarApi = this.$refs.calendar.getApi();
        calendarApi.addEvent({
          id: createdTodo.todoNo,
          title: createdTodo.title,
          start: createdTodo.dueDate,
          allDay: true,
          classNames: ['todo-event'],
        });
        this.closeTodoModal();
        await this.fetchCalendarData();
      } catch (e) {
        console.error(e);
      }
    },
    async addPlan(plan) {
      if (!plan.planCls || !plan.planDate) {
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        }, 2000);
        return;
      }
      this.mode = 'add';
      this.showAlert = false;
      const setPersonalYn = {
        ...plan,
        calendarNo: this.calendarNo,
        personalYn: plan.personalYn ? 'Y' : 'N',
      };
      try {
        const response = await api.post('/plans', setPersonalYn);
        const createdPlan = response.data.result;
        const calendarApi = this.$refs.calendar.getApi();
        const className = `${plan.planCls.toLowerCase()}_plan-event`;
    
        calendarApi.addEvent({
          id: createdPlan.planNo,
          title: createdPlan.title,
          start: createdPlan.planDate + 'T' + createdPlan.startTime,
          end: createdPlan.planDate + 'T' + createdPlan.endTime,
          allDay: false,
          classNames: [className], 
        });
        this.closePlanModal();
    } catch (e) {
      console.error(e);
    }
  },
  
  // 수정
  async updateTodo(updatedTodo) {
    const calendarApi = this.$refs.calendar.getApi();
    const event = calendarApi.getEventById(updatedTodo.todoNo);

    if (event) {
      event.setProp('title', updatedTodo.title);
      event.setStart(updatedTodo.dueDate);
      event.setExtendedProp('todoCls', updatedTodo.todoCls);
      event.setExtendedProp('priority', updatedTodo.priority);
      event.setExtendedProp('status', updatedTodo.status);
      }
    },

    async updatePlan(updatedPlan) {
      const calendarApi = this.$refs.calendar.getApi();
      const event = calendarApi.getEventById(updatedPlan.planNo);

      if (event) {
        event.remove();
      }

      const className = `${updatedPlan.planCls.toLowerCase()}_plan-event`;

      calendarApi.addEvent({
        id: updatedPlan.planNo,
        title: updatedPlan.title,
        start: `${updatedPlan.planDate}T${updatedPlan.startTime}`,
        end: `${updatedPlan.planDate}T${updatedPlan.endTime}`,
        allDay: false,
        classNames: [className], 
      });

      this.closePlanModal();

      setTimeout(() => {
        this.handleAlert({
          message: '일정이 수정되었습니다.',
          type: 'success',
        });
      }, 1000);
  },
  
  // 닫기 및 초기화
    closeTodoModal() {
      this.AddTodoModal = false;
      this.selectedOption = null;
      setTimeout(() => {
        this.clearTodoForm();
      }, 300);
    },
    closePlanModal() {
      this.AddPlanModal = false;
      this.selectedOption = null;
      setTimeout(() => {
        this.clearPlanForm();
      }, 300);
    },
    clearTodoForm() {
      this.mode = 'add';
      this.todo = {
        calendarNo: this.calendarNo,
        title: '',
        todoCls: '',
        priority: '',
        dueDate: '',
        status: '',
        privateYn: 'N',
        content: '',
      };
    },
    clearPlanForm() {
      this.mode = 'add';
      this.plan = {
        calendarNo: this.calendarNo,
        title: '',
        planCls: '',
        planDate: '',
        startTime: '',
        endTime: '',
        personalYn: 'N',
        content: '',
      };
      this.planDetails = {
        title: '',
        note: '',
      };
      this.isPersonal = false;
    },
  // 클릭 이벤트
    handleDateSelect(selectInfo) {
      this.AddTodoModal = true;
      this.AddPlanModal = true;
      this.todo.dueDate = selectInfo.startStr;
      this.plan.planDate = selectInfo.startStr;
    },
    async handleEventClick(clickInfo) {
      console.log('clickInfo',clickInfo)
      const eventId = clickInfo.event.id.replace(/^(plan-|todo-)/, '');
      const eventClassNames = clickInfo.event.classNames;

      const statusMapping = {
        TODO: '진행 전',
        INPROGRESS: '진행 중',
        DONE: '완료',
      };
      
      const priorityMapping = {
        HIGH: '높음',
        MEDIUM: '중간',
        LOW: '낮음',
      };

      if (eventClassNames.some(className => className.includes('plan'))) {
        this.AddPlanModal = true;
        this.mode = 'edit';
        try {        
          const response = await api.get(`/plans/${eventId}`);  
          const planDetails = response.data.result;
          this.plan = {     
            planNo: planDetails.planNo,
            calendarNo: planDetails.calendarNo,
            title: planDetails.title,
            planCls: reversePlanCls[planDetails.planCls],
            planDate: planDetails.planDate,          
            startTime: planDetails.startTime,          
            endTime: planDetails.endTime,
            personalYn: planDetails.personalYn,     
            content: planDetails.content,
            domainNo: planDetails.domainNo,
          };
          this.DetailPlanShow = false;
        } catch (e) {        
            console.error(e);      
          }
      } 
      else if (eventClassNames.includes('todo-event')) {
        this.AddTodoModal = true;
        this.mode = 'edit'; 
        try {        
          const response = await api.get(`/todos/${eventId}`);
          const todoDetails = response.data.result;

          this.todo = {
            todoNo: todoDetails.todoNo,
            calendarNo: todoDetails.calendarNo,
            title: todoDetails.title,
            todoCls: todoDetails.todoCls,
            priority: priorityMapping[todoDetails.priority] || todoDetails.priority,
            dueDate: todoDetails.dueDate,
            status: statusMapping[todoDetails.status] || todoDetails.status, 
            privateYn: todoDetails.privateYn,
            content: todoDetails.content,
          };
          this.DetailTodoShow = false;
        } catch (e) {        
          console.error(e);      
        }
      }
      else if (eventClassNames.includes('act-event')) {
        const response = await api.get(`/acts/${eventId}`);
        const actDetails = response.data.result;
        const convertCls = reverseActStatus[actDetails.cls] || actDetails.cls;
        const actNo = actDetails.actNo;

        this.$router.push({
          name: 'FormCustom',
          params: { actNo },
          query: { cls: convertCls }
        });
      }
    },
    handleEvents(events) {
      this.currentEvents = events;
    },
    handleAlert(alertData) {
      this.alertMessage = alertData.message;
      this.alertType = alertData.type;
      setTimeout(() => {
        this.showSuccessAlert = true;
      },500);
      setTimeout(() => {
        this.showSuccessAlert = false;
      }, 3000);
    },
    async deleteTodo(todoToDelete) {
      try {
        await api.delete(`/todos/${todoToDelete.todoNo}`);
        const calendarApi = this.$refs.calendar.getApi();
        
        const event = calendarApi.getEventById(todoToDelete.todoNo);
        if (event) {
          event.remove();
        }
        this.closeTodoModal();
        this.handleAlert({
          message: '할 일이 삭제되었습니다.',
          type: 'success',
        });
      } catch (e) {
        console.error(e);
      }
    },
    async deletePlan(planToDelete) {
      try {
        await api.delete(`/plans/${planToDelete.planNo}`);
        const calendarApi = this.$refs.calendar.getApi();
        
        const event = calendarApi.getEventById(planToDelete.planNo);
        if (event) {
          event.remove();
        }
        localStorage.setItem('showAlertAfterReload', '일정이 삭제되었습니다.');
        // this.handleAlert({
        //   message: '일정이 삭제되었습니다.',
        //   type: 'success',
        // });
        this.closePlanModal();
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    },
  },
  watch: {
    selectedOption(value) {
      if (value === '할 일') {
        this.AddTodoModal = true;
      } else if (value === '영업활동') {
        this.$router.push('/apps/act');
      } else if (value === '일정') {
        this.AddPlanModal = true;
      }
    },
  },
});

</script>

<template>
  <div class='demo-app'>
    <div class='demo-app-main'>
      <v-row >
        <v-col cols="2">
          <v-select
            v-model="selectedOption"
            :items="items"
            label="일정 생성"
            outlined
          ></v-select>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-switch
            v-model="showCompanyEvents"
            label="전사 일정만 보기"
            inset
            color="primary" 
            class="label-bold"
          />
        </v-col>
      </v-row>

      <FullCalendar ref="calendar" class='demo-app-calendar rounded-md':options="calendarOptions">
        <template v-slot:eventContent="arg">
          <!-- <div class="text-subtitle-1 pa-1 text-truncate">{{ arg.event.title }}</div> -->
          <div class="event-content">
            <span v-if="arg.event.start && arg.event.startStr.includes('T')" class="event-time">
              {{ arg.event.startStr.split('T')[1].slice(0, 5) }}
            </span>
            <span class="event-title">{{ arg.event.title }}</span>
          </div>
        </template>
      </FullCalendar>

      <TodoModal v-model="AddTodoModal"
        :todo="todo" :priorityOptions="priorityOptions" :statusOptions="statusOptions" :mode="mode"
        :currentUserCalendarNo="currentUserCalendarNo" 
        @close="closeTodoModal" @add="addTodo" @delete="deleteTodo" @update="updateTodo" @show-alert="handleAlert"
      />
      <PlanModal v-model="AddPlanModal"
        :plan="plan" :planClsOptions="planClsOptions" :statusOptions="statusOptions" :mode="mode"
        :currentUserCalendarNo="currentUserCalendarNo" 
        @close="closePlanModal" @add="addPlan" @delete="deletePlan" @update="updatePlan" @show-alert="handleAlert" 
      />

      <v-alert v-if="showSuccessAlert" type="success" variant="tonal" :class="['alert', alertType]">
        <h5 class="text-h5 text-capitalize">Success</h5>
          {{ alertMessage }}
      </v-alert>
    </div>
  </div>
</template>
<style>

.calendar-container {
  position: relative;
}

.select-item {
  margin-bottom: 20px;
  width: 200px;
}

.warn-alert {
	position: fixed;
	bottom: 10%; 
	left: 50%;
	transform: translateX(-50%);
	z-index: 3000;
	width: 100%;
}

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

.label-bold .v-input__control .v-label {
  font-size: 14px;
  font-weight: bold;
}

.event-time {
  font-weight: bold;
  font-size: 14px;
}
.event-title {
  margin-left: 5px;
  font-size: 14px;
  font-weight: bold;

}
</style>