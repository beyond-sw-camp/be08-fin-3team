<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { useEcomStore } from '@/stores/apps/eCommerce';
import {  Menu2Icon} from 'vue-tabler-icons';
import ProfileDD from './ProfileDD.vue';
import Logo from '../logo/Logo.vue';
import RtlLogo from '../logo/RtlLogo.vue';
import LogoIcon from '../logo/LogoIcon.vue'

const customizer = useCustomizerStore();
const showSearch = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    priority.value = newPriority;
});

// count items
const store = useEcomStore();
const getCart = computed(() => {
    return store.cart;
});
</script>

<template>
    <v-app-bar elevation="5" :priority="priority" height="64" color="primary" id="top">
        <!---LOGO RTL/LTR--->
        <v-locale-provider v-if="customizer.setRTLLayout" rtl>
            <div class="pt-2 d-sm-flex d-none">
                <RtlLogo />
            </div>
            <div class="pt-2 pr-2 d-sm-none d-flex">
                <LogoIcon />
            </div>
        </v-locale-provider>
        <v-locale-provider v-else>
            <div class="pt-2 d-sm-flex d-none">
                <Logo />
            </div>
            <div class="pt-2 pr-2 d-sm-none d-flex">
                <LogoIcon />
            </div>
        </v-locale-provider>

        <v-btn class="hidden-md-and-down " icon color="primary" variant="text"
            @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)">
            <Menu2Icon size="25" />
        </v-btn>
        <v-btn class="hidden-lg-and-up" icon variant="text" @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
            <Menu2Icon size="25" />
        </v-btn>

        <v-spacer />
        <!-- User Profile -->
        <div class="ml-2">
            <ProfileDD />
        </div>
    </v-app-bar>

</template>
