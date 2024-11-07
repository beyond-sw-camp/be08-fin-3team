import { defineStore } from 'pinia';
import api from '@/api/axiosinterceptor';

export const useCalendarUserStore = defineStore('companyCalendar', {
  state: () => ({
    events: [],//todo + plan
    showCompanyEvents: false,
    calendarNo: localStorage.getItem('calendarNo') || null, 
  }),
  
  actions: {
    // calendarNo 가져오기
    async fetchUserCalendarNo() {
      try {
        const response = await api.get('/calendars/user/data');
        if (response.data.isSuccess) {
          this.calendarNo = response.data.result.calendarNo;
          localStorage.setItem('calendarNo', this.calendarNo);
        }
      } catch (error) {
        console.error(error);
      }
    },
    clearCalendarNo() {
      this.calendarNo = null;
      localStorage.removeItem('calendarNo');
    },
    // 전사일정 가져오기
    async fetchCompanyEvents() {
      try {
        const response = await api.get('/company/calendars');
        console.log('response',response)
        if (response.data.isSuccess) {
          const { plans, todos } = response.data.result;

          const planEvents = plans.map(plan => ({
            id: `plan-${plan.planNo}`,
            title: plan.title,
            start: plan.planDate + 'T' + plan.startTime,
            end: plan.planDate + 'T' + plan.endTime,
            extendedProps: {...plan },
            classNames: ['company_plan-event'],
          }));

          const todoEvents = todos.map(todo => ({
            id: `todo-${todo.todoNo}`,
            title: todo.title,
            start: todo.dueDate,
            extendedProps: {...todo },
            classNames: ['todo-event'],
          }));

          this.events = [...planEvents, ...todoEvents];
        }
      } catch (error) {
        console.error(error);
      }
    },
    
    // 전사일정 토글 상태 변경
    toggleCompanyEvents() {
      this.showCompanyEvents = !this.showCompanyEvents;
      
      if (this.showCompanyEvents) {
        this.fetchCompanyEvents();
      } else {
        this.events = [];
      }
    },
  },
});
