import {defineStore} from 'pinia';

export const useCounterStore = defineStore('coutner',{
    state:()=>({
        counter:1,
    }),
    getters:{
      
    }
})