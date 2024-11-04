<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems from './sidebarItem';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Logo from '../logo/Logo.vue';
import { useAuthStore } from '@/stores/auth';
import { PowerIcon } from 'vue-tabler-icons';
import { UserIcon } from 'vue-tabler-icons';

const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);
const authStore = useAuthStore();

const name = ref<string | null>(null);

onMounted(() => {
    name.value = localStorage.getItem("loginUserName");
});


</script>

<template>
    <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="0" rail-width="75" 
        app class="leftSidebar" :rail="customizer.mini_sidebar" expand-on-hover width="256">

        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar">
            <div class="profile">
                <!-- <div class="profile-pic profile-pic py-7 px-3">
                    <v-avatar size="45">
                        <img src="@/assets/images/profile/user2.jpg" width="50" alt="Julia" />
                    </v-avatar>
                </div> -->
                <div class="profile-name d-flex align-center px-3">
                    <UserIcon class="text-white mr-2" />
                    <h4 class="text-white font-weight-medium">{{ name }}</h4>
                    <div class="ml-auto profile-logout">
                        <v-btn variant="text" icon rounded="md" color="white" @click="authStore.logout()">
                            <PowerIcon size="22"/>
                            <v-tooltip activator="parent" location="top">Logout</v-tooltip>
                        </v-btn>
                    </div>
                </div>
            </div>
            <v-list class="py-6 px-4">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu">
                    <!---Item Sub Header -->
                    <NavGroup :item="item" v-if="item.header" :key="item.title" />
                    <!---If Has Child -->
                    <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                    <!---Single Item-->
                    <NavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
            </v-list>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
