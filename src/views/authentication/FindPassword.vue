<script setup lang="ts">
import Logo from '@/layouts/full/logo/LogoAuth.vue';
import ResetPassword from '@/components/auth/ResetForm.vue';
import LogoIcon from '@/assets/images/logos/logolight.svg';
</script>

<template>
    <div class="authentication">
        <v-container fluid class="pa-3">
             <v-row class="h-100vh d-flex justify-center align-center">
                <v-col cols="12" lg="4"  xl="5" class="d-flex align-center">
                    <v-card rounded="md" elevation="10" class="px-sm-1 px-0  mx-auto">
                        <v-card-item class="pa-sm-8">
                            <div class="d-flex justify-center my-5">  <img :src="LogoIcon" alt="home" /></div>
                            
                            <p class="text-subtitle-1 text-center text-10">
                                가입하신 이메일 주소를 입력해주세요
                            </p>
                            <ResetPassword/>
                            <v-btn size="large" color="lightprimary" to="/auth/login" block class="mt-5 text-primary" flat>로그인 페이지로 돌아가기</v-btn>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
 