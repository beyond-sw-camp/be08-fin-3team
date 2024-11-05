<script setup>
import DetailForm from '@/components/lead/DetailForm.vue';
import Timeline from '@/components/lead/Timeline.vue';
</script>

<template>
    <v-row>
        <v-col cols="9">
            <DetailForm />
        </v-col>
        <v-col cols="3"><Timeline /> </v-col>
    </v-row>
</template>
