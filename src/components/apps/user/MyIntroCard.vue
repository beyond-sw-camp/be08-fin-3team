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
                    <h4 class="text-h4">Introduction</h4>
                    <p class="my-5 text-subtitle-1 lh-md">
                        안녕, 내이름은 {{ name }}. 나는 영업하는걸 좋아해. 앞으로 더 많은 고객들에게 영업을 할 수 있는 기회를 얻고싶어. 다들 잘부탁해.
                    </p>
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
