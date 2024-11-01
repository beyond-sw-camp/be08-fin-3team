<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { useEcomStore } from '@/stores/apps/eCommerce';
// Icon Imports
import { GridDotsIcon, LanguageIcon, SearchIcon, Menu2Icon, BellRingingIcon, ShoppingCartIcon } from 'vue-tabler-icons';
import Logo from '../logo/Logo.vue';
import LogoIcon from '../logo/LogoIcon.vue';
import RtlLogo from '../logo/RtlLogo.vue';
// dropdown imports
import LanguageDD from '../vertical-header/LanguageDD.vue';
import NotificationDD from '../vertical-header/NotificationDD.vue';
import ProfileDD from '../vertical-header/ProfileDD.vue';
import Searchbar from '../vertical-header/Searchbar.vue';
import ThemeToggler from '../vertical-header/ThemeToggler.vue';

const customizer = useCustomizerStore();
const showSearch = ref(false);
const drawer = ref(false);
const appsdrawer = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    // yes, console.log() is a side effect
    priority.value = newPriority;
});

// count items
const store = useEcomStore();
const getCart = computed(() => {
    return store.cart;
});
</script>

<template>
    <v-app-bar elevation="10" :priority="priority" height="64" class="horizontal-header" color="primary">
        <div :class="customizer.boxed ? 'maxWidth v-toolbar__content px-lg-0 px-4' : 'v-toolbar__content px-6'">
            <v-locale-provider v-if="customizer.setRTLLayout" rtl>
                <div class="pt-2 pr-4 d-sm-flex d-none">
                    <RtlLogo />
                </div>
                <div class="pt-2 pr-2 d-sm-none d-flex">
                    <LogoIcon />
                </div>
            </v-locale-provider>
            <v-locale-provider v-else>
                <div class="pt-2 pr-4 d-sm-flex d-none">
                    <Logo />
                </div>
                <div class="pt-2 pr-2 d-sm-none d-flex">
                    <LogoIcon />
                </div>
            </v-locale-provider>

            <v-btn class="hidden-md-and-up" icon variant="text" @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
                <Menu2Icon size="25" />
            </v-btn>

            <!-- ------------------------------------------------>
            <!-- Search part -->
            <!-- ------------------------------------------------>

            <Searchbar />

            <!---/Search part -->
            <v-spacer />
            <!-- ---------------------------------------------- -->
            <!---right part -->
            <!-- ---------------------------------------------- -->

            <!-- ---------------------------------------------- -->
            <!-- translate -->
            <!-- ---------------------------------------------- -->
            <div class="me-1">
                <ThemeToggler />
            </div>
            <LanguageDD />

            <!-- ---------------------------------------------- -->
            <!-- Notification -->
            <!-- ---------------------------------------------- -->

            <NotificationDD />

            <!-- ---------------------------------------------- -->
            <!-- ShoppingCart -->
            <!-- ---------------------------------------------- -->
            <v-btn icon variant="text" color="primary" to="/ecommerce/checkout">
                <v-badge color="error" :content="getCart?.length">
                    <!-- <ShoppingCartIcon stroke-width="1.5" size="22" /> -->
                    <v-icon size="22">mdi-cart</v-icon>
                </v-badge>
            </v-btn>

            <!-- ---------------------------------------------- -->
            <!-- User Profile -->
            <!-- ---------------------------------------------- -->
            <div class="ml-3">
                <ProfileDD />
            </div>
        </div>
    </v-app-bar>
</template>
