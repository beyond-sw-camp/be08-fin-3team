<script setup>
import { UserIcon, UserQuestionIcon } from 'vue-tabler-icons';

const props = defineProps({
    customerCount: Number,
    potenCustomerCount: Number
});
</script>
<template>
    <v-col class="px-3" cols="12">
        <v-card-subtitle class="sub_title">고객</v-card-subtitle>
        <v-divider :thickness="3" class="border-opacity-50 mb-3" color="primary"></v-divider>
        <v-row>
            <v-col cols="12" lg="6">
                <v-card class="bg-primary" elevation="10">
                    <v-card-text class="pa-6">
                        <component :is="UserIcon" stroke-width="1.5" size="25" />
                        <h5 class="text-h5 mt-2 text-white">{{ props.customerCount }}</h5>
                        <span class="text-white">고객</span>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="6">
                <v-card class="bg-secondary" elevation="10">
                    <v-card-text class="pa-6">
                        <component :is="UserQuestionIcon" stroke-width="1.5" size="25" />
                        <h5 class="text-h5 mt-2 text-white">{{ props.potenCustomerCount }}</h5>
                        <span class="text-white">잠재고객</span>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-col>
</template>
