<script setup>
import { MailIcon ,UserIcon} from 'vue-tabler-icons';
import { profileDD } from '@/_mockApis/headerData';
import { useProfileImageStore } from '@/stores/userInfo';
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const store = useProfileImageStore();
const name = ref('');
const email = ref('');
const profileImg = computed(()=>store.profileImg);

onMounted(()=>{
    store.refreshImg();
    name.value = localStorage.getItem("loginUserName");
    email.value = localStorage.getItem("loginUserEmail");
    
})
</script>

<template>
    <v-menu :close-on-content-click="false" class="profile_popup">
        <template v-slot:activator="{ props }">
            <v-btn class="custom-hover-primary" variant="text" v-bind="props" icon>
                <v-img v-if="profileImg" :src=profileImg class="profile-image"/>
                <i v-else class="mr-2 mdi text-h1 mdi-account-circle"></i>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="360" elevation="10">
            <div class="px-8 pt-6">
                <h6 class="text-h6 font-weight-medium">내 정보</h6>
                <div class="d-flex align-center mt-4 pb-6">
                    <div class="ml-3">
                        <div class="d-flex align-center mt-1">
                            <UserIcon size="18" stroke-width="1.5" />
                            <span class="text-subtitle-1 font-weight-regular textSecondary ml-2">{{ name }}</span>
                        </div>
                        <div class="d-flex align-center mt-1">
                            <MailIcon size="18" stroke-width="1.5" />
                            <span class="text-subtitle-1 font-weight-regular textSecondary ml-2">{{ email }}</span>
                        </div>
                    </div>
                </div>
                <v-divider></v-divider>
            </div>
            <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 240px">
                <v-list class="py-0 theme-list" lines="two">
                    <v-list-item v-for="item in profileDD" :key="item.title" class="py-4 px-8 custom-text-primary" :to="item.href">
                        <template v-slot:prepend>
                            <v-avatar size="48" color="lightprimary"  rounded="md">
                                <img :src="item.avatar" width="24" height="24" :alt="item.avatar" />
                            </v-avatar>
                        </template>
                        <div>
                            <h6 class="text-subtitle-1 font-weight-semibold mb-2 custom-title">{{ item.title }}</h6>
                        </div>
                        <p class="text-subtitle-1 font-weight-regular textSecondary">{{ item.subtitle }}</p>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
            <div class="pt-4 pb-6 px-8 text-center">
                <v-btn color="primary" variant="outlined" block @click="authStore.logout()">로그아웃</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>

<style>
.profile-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
