import { defineStore } from "pinia";

export const useProfileImageStore = defineStore('profileImg',{

    state:()=>({
        profileImg: localStorage.getItem("profileUrl") !== 'null' ? localStorage.getItem("profileUrl") : null
    }), // 상태
    getters:{}, // computed
    actions:{
        refreshImg(){
            this.profileImg =  localStorage.getItem("profileUrl") !== 'null' ? localStorage.getItem("profileUrl") : null
        }
    } // 상태 수정 메서드
});