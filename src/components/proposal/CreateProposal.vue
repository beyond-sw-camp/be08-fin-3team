<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

const router = useRouter();

const breadcrumbs = ref([
    { text: '제안 리스트', disabled: false, href: '/proposals' },
    { text: '제안 등록', disabled: true, href: '/proposals/create' }
]);

const valid = ref(false);

const loading = ref(false);

const form = ref(null);

const editedItem = ref({
    propNo: null,
    leadNo: null,
    leadName: '',
    name: '',
    cont: '',
    reqDate: '',
    startDate: '',
    endDate: '',
    submitDate: '',
    prDate: '',
    note: ''
});

const leads = ref([]);
const leadModal = ref(false);

onMounted(async () => {
    try {
        const response = await api.get('/leads');
        console.log('API response', response.data);

        if (response.data.isSuccess && Array.isArray(response.data.result)) {
            leads.value = response.data.result.map((lead) => ({
                leadNo: lead.leadNo,
                name: lead.name
            }));
        } else {
            console.error('Expected an array but got:', response.data);
        }
    } catch (error) {
        console.error('failed to fetch leads: ', error);
    }
});

const openLeadModal = () => {
    leadModal.value = true;
};

const closeLeadModal = () => {
    leadModal.value = false;
};

const selectLead = (lead) => {
    editedItem.value.leadNo = lead.leadNo;
    editedItem.value.leadName = lead.name;
    leadModal.value = false;
};

const save = async () => {
    if (form.value) {
        const isValid = await form.value.validate();
        if (!isValid) {
            alert('폼에 오류가 있습니다. 모든 필드를 올바르게 입력해주세요.');
            return;
        }
    }
    console.log('Edited Item before saving:', editedItem.value);

    loading.value = true;

    try {
        const res = await api.post('/proposals', editedItem.value);
        if (res.status === 200 || res.status === 201) {
            successAlert.value = true;
            alertDialog.value = true;

            setTimeout(() => router.push('/estimates'), 1500);
        }
    } catch (error) {
        console.error('등록 실패:', error);
        errorAlert.value = true;
        alertDialog.value = true;
    } finally {
        loading.value = false;
    }
};

const cancel = () => {
    router.push('/proposals');
};

const alertDialog = ref(false);
const successAlert = ref(false);
const errorAlert = ref(false);
const warningAlert = ref(false);
</script>
<template>
    <v-dialog v-model="alertDialog" max-width="500" class="dialog-mw">
        <v-card>
            <v-card-text>
                <v-alert v-if="successAlert" type="success" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Success</h5>
                    <div>견적이 성공적으로 삭제되었습니다.</div>
                </v-alert>
                <v-alert v-if="errorAlert" type="error" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Error</h5>
                    <div>견적 삭제에 실패했습니다. 다시 시도해주세요.</div>
                </v-alert>
                <v-alert v-if="warningAlert" type="warning" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Warning</h5>
                    <div>필수 항목을 입력해주세요.</div>
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click="alertDialog = false" flat>Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <div>
        <BaseBreadcrumb :title="''" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

        <v-container>
            <UiParentCard title="">
                <v-form ref="form" v-model="valid" @submit.prevent="save">
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="editedItem.name"
                                label="제안명"
                                :rules="[(v) => !!v || '제안명을 입력해주세요']"
                                required
                                outlined
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="editedItem.note" label="내용" outlined></v-textarea>
                        </v-col>
                    </v-row>

                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="editedItem.reqDate"
                            label="요청일"
                            type="date"
                            :rules="[(v) => !!v || '요청일을 선택해주세요']"
                            required
                            outlined
                        ></v-text-field>
                    </v-col>

                    <!-- 영업기회 -->
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="editedItem.leadName"
                            :items="leads"
                            item-text="name"
                            :rules="[(v) => !!v || '영업기회 버튼을 눌러 선택해주세요']"
                            readonly
                            outlined
                        ></v-text-field>

                        <v-btn color="primary" variant="flat" class="mr-2 mdi text-h6 mdi-note-plus-outline" @click="openLeadModal"
                            >영업기회 선택</v-btn
                        >
                    </v-col>

                    <v-dialog v-model="leadModal" max-width="600px">
                        <v-card>
                            <v-card-title class="d-flex justify-space-between">
                                <span>영업기회 리스트</span>
                                <v-btn icon @click="closeLeadModal">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text>
                                <v-list>
                                    <v-list-item-group color="primary">
                                        <v-list-item v-for="lead in leads" :key="lead.leadNo" @click="selectLead(lead)">
                                            <v-list-item-content>
                                                <v-list-item-title>{{ lead.name }}</v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-dialog>

                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="editedItem.startDate"
                            label="제안 시작일"
                            type="date"
                            :rules="[(v) => !!v || '제안 시작일을 선택해주세요']"
                            required
                            outlined
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="editedItem.endDate"
                            label="제안 종료일"
                            type="date"
                            :rules="[(v) => !!v || '제안 종료일을 선택해주세요']"
                            required
                            outlined
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="editedItem.prDate"
                            label="발표일"
                            type="date"
                            :rules="[(v) => !!v || '발표일을 선택해주세요']"
                            required
                            outlined
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                        <v-textarea v-model="editedItem.note" label="비고" outlined></v-textarea>
                    </v-col>

                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn color="primary" class="mr-3" flat type="submit" :disabled="!valid || loading">
                                <v-progress-circular v-if="loading" indeterminate color="white" size="20"></v-progress-circular>
                                저장
                            </v-btn>
                            <v-btn color="error" class="mr-3" flat @click="cancel">취소</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </UiParentCard>
        </v-container>
    </div>
</template>

<style scoped></style>
