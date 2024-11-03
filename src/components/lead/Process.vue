<template>
    <VCardSubtitle class="subtitle">단위 : (건/천원)</VCardSubtitle>
    <v-row>
        <v-col cols="12">
            <v-row v-for="(process, label) in processData" :key="label" align="center" class="py-2">
                <v-col cols="3" class="d-flex align-center">
                    <v-avatar color="white" size="40" class="mr-2">
                        <v-icon :color="process.color">mdi-cube-outline</v-icon>
                    </v-avatar>
                    <span :style="{ color: process.color, fontWeight: 'bold' }">{{ process.label }}</span>
                </v-col>
                <v-col cols="3">
                    <span>{{ process.count }} 건</span>
                </v-col>
                <v-col cols="3" class="text-center">
                    <span>{{ process.amount.toLocaleString() }}</span>
                </v-col>
                <v-col cols="2" class="text-right">
                    <v-avatar color="grey lighten-3" size="16">
                        <v-icon :color="process.color">mdi-circle</v-icon>
                    </v-avatar>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref } from 'vue';

const processData = ref([
    { label: '인지', color: '#ff9800', count: 3, amount: 100 },
    { label: '제안', color: '#00bcd4', count: 1, amount: 0 },
    { label: '협상', color: '#607d8b', count: 0, amount: 0 },
    { label: '계약', color: '#ff5722', count: 2, amount: 11500 }
]);
</script>

<style lang="scss" scoped>
.subtitle {
    text-align: right;
}

.text-h6 {
    font-weight: bold;
}
</style>
