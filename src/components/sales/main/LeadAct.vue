<script setup>
import { UserPlusIcon, BriefcaseIcon } from 'vue-tabler-icons';

const props = defineProps({
    progressCount: Number,
    successCount: Number,
    failCount: Number,
    holdCount: Number,
    planCount: Number,
    completeCount: Number,
    completePercent: Number
});
</script>
<template>
    <v-col cols="12">
        <v-card-subtitle class="sub_title">영업기회/활동</v-card-subtitle>
        <v-divider :thickness="3" class="border-opacity-50 mb-3" color="primary"></v-divider>
        <v-row>
            <v-col cols="12" lg="2" class="text-center">
                <v-card class="bg-primary" elevation="10">
                    <v-card-text class="pa-6">
                        <component :is="UserPlusIcon" stroke-width="1.5" size="25" />
                        <h5 class="text-h5 mt-2 text-white"></h5>
                        <span class="text-h5 text-white">영업기회</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="2" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>진행중</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.progressCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="2" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>성공</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.successCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="2" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>실패</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.failCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="2" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>보류</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.holdCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" lg="2" class="text-center">
                <v-card class="bg-primary" elevation="10">
                    <v-card-text class="pa-6">
                        <component :is="BriefcaseIcon" stroke-width="1.5" size="25" />
                        <h5 class="text-h5 mt-2 text-white"></h5>
                        <span class="text-h5 text-white">영업활동</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="3" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>계획</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.planCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="3" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>완료</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.completeCount }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="3" class="text-center">
                <v-card variant="outlined">
                    <v-card-title>완료 (%)</v-card-title>
                    <v-card-text class="pa-5">
                        <span class="text-h5">{{ props.completePercent }}</span>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-col>
</template>
