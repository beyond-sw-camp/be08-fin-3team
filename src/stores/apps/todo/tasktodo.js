import { defineStore } from 'pinia';
import api from '@/api/axiosinterceptor';

export const useTaskStore = defineStore({
  id: 'tasks',
  state: () => ({
    tasks: []
  }),

  actions: {
    async fetchTasks() {
      const statusMapping = {
        TODO: '진행 전',
        INPROGRESS: '진행 중',
        DONE: '완료',
      };
      try {
        const response = await api.get('/todos');
        if (response.data.isSuccess) {
          this.tasks = response.data.result.map(todo => ({
            priority: todo.priority,
            status: statusMapping[todo.status] || todo.status, 
            name: todo.title,
            dueDate: todo.dueDate,
            category: todo.todoCls,
            content: todo.content
          }));
        }
      } catch (error) {
        console.error(error);
      }
    },
  }
});