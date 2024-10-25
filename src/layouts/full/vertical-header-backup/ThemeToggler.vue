<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { MoonFilledIcon, SunFilledIcon } from 'vue-tabler-icons';

const theme = useTheme();
const customizer = useCustomizerStore();

// template skin color options
const themeColors = ref([
    {
        name: 'BLUE_THEME',
        bg: 'togglethemeBlue'
    },
    {
        name: 'DARK_BLUE_THEME',
        bg: 'togglethemeDarkBlue'
    }
]);
</script>

<template>
    <div class="position-relative">
        <v-item-group mandatory v-model="customizer.actTheme" class="d-flex">
            <div v-for="theme in themeColors" :key="theme.name">
                <v-item v-slot="{ toggle }" :value="theme.name">
                    <v-btn icon :class="theme.bg" class="custom-hover-primary" variant="text" color="primary" @click="toggle">
                        <SunFilledIcon v-if="theme.bg == 'togglethemeBlue'" :class="theme.bg + ' text-white'" height="24" />
                        <MoonFilledIcon v-if="theme.bg == 'togglethemeDarkBlue'" :class="theme.bg + ' text-white'" height="24" />
                    </v-btn>
                </v-item>
            </div>
        </v-item-group>
    </div>
</template>
