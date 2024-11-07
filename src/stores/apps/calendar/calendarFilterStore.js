import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalendarFilterStore = defineStore('calendar', () => {
  const selectedCategory = ref([]);
  const selectedStatus = ref([]);
  const selectedCalendarCategory = ref([]);

  const calendarData = ref([]);

  const filteredData = computed(() => {
    return calendarData.value.filter(item => {
      
      const selectecPlanFilter = selectedCategory.value.includes('plan');
      
      const matchCategory = selectedCategory.value.length > 0
      ? selectedCategory.value.includes(item.category) || 
        Array.isArray(item.classNames) && selectecPlanFilter && item.classNames.some(cs => cs.includes('plan'))
      : true;

      const matchStatus = selectedStatus.value.length > 0 
      ? selectedStatus.value.includes(item.status)
      : true;

      const matchCalendarCategory = selectedCalendarCategory.value.length > 0 
        ? selectedCalendarCategory.value.includes(item.category)
        : true;  

      return matchCategory && matchStatus && matchCalendarCategory;
    });
  });
  
  function setCategory(category) {
    selectedCategory.value = category;
  }

  function setStatus(status) {
    selectedStatus.value = status;
  }

  function setCalendarCategory(category) {
    const index = selectedCalendarCategory.value.indexOf(category);
    if (index === -1) {
      selectedCalendarCategory.value.push(category);
    } else {
      selectedCalendarCategory.value.splice(index, 1); 
    }
  }

  function resetFilters() {
    selectedCategory.value = [];
    selectedStatus.value = [];
    selectedCalendarCategory.value = [];
  }

  function setCalendarData(newData) {
    const mergedData = [...calendarData.value, ...newData].reduce((acc, curr) => {
      const index = acc.findIndex(item => 
        item.category === curr.category && 
        item.title === curr.title && 
        item.start === curr.start && 
        item.end === curr.end
      );
      if (index === -1) {
        acc.push(curr);
      } else {
        acc[index] = curr;
      }
      return acc;
    }, []);
    calendarData.value = mergedData;
  }

  return {
    selectedCategory,
    selectedStatus,
    selectedCalendarCategory,
    filteredData,
    setCategory,
    setStatus,
    setCalendarCategory,
    resetFilters,
    setCalendarData
  };
});
