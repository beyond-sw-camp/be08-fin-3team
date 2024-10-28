<script setup lang="ts">
const props = defineProps({
    email:String,
    dept:String,
    joinDate:String,
    employeeId:String,
    name:String

})
</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined" class="bg-surface">
                <v-card-item>
                    <!-- <h4 class="text-h4">Introduction</h4> -->
                
                    <div class="d-flex gap-3 mb-5">
                        <BriefcaseIcon size="21" />
                        <span class="text-h6">부서 : {{ dept }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MailIcon size="21" />
                        <span class="text-h6">메일 : {{ email }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <DeviceDesktopIcon size="21" />
                        <span class="text-h6">사원번호 : {{ employeeId }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MapPinIcon size="21" />
                        <span class="text-h6">가입일 : {{ joinDate }}</span>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
