<script setup>
import { computed, onMounted, shallowRef,watch,ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { useAuthStore } from '@/stores/auth';
import HorizontalItems from './horizontalItems';
import NavItem from './NavItem/Index.vue';
import NavCollapse from './NavCollapse/Index.vue';

const customizer = useCustomizerStore();
const originMenu = shallowRef(HorizontalItems);
const { mdAndUp } = useDisplay();
const userStore = useAuthStore();
const sidebarMenu = ref();

// const sidebarMenu = computed(()=>{
//     if(userStore.role ==="ADMIN"){
//         return originMenu.value;
//     }
//     return originMenu.value.filter((item)=>!item.adminOnly);
// });

const changeMenu=()=>{
    if(localStorage.getItem("loginUserRole") ==="ADMIN"){
        sidebarMenu.value =  originMenu.value;
    }else{
        sidebarMenu.value =  originMenu.value.filter((item)=>!item.adminOnly);
    }
}

onMounted(()=>{
    changeMenu();
})
</script>

<template>
    <template v-if="mdAndUp">
        <div class="horizontalMenu border-bottom bg-surface position-relative">
            <div :class="customizer.boxed ? 'maxWidth' : 'px-12'">
                <ul class="gap-1 horizontal-navbar d-flex justify-content-center">
                    <!---Menu Loop -->
                    <li v-for="(item, i) in sidebarMenu" :key="i" class="navItem">
                        <!---If Has Child -->
                        <NavCollapse :item="item" :level="0" v-if="item.children" />
                        <!---Single Item-->
                        <NavItem :item="item" v-else />
                        <!---End Single Item-->
                    </li>
                </ul>
            </div>    
        </div>
    </template>
</template>
<style lang="scss">
.horizontal-navbar {
    display: flex;
    justify-content: center;
}</style>
