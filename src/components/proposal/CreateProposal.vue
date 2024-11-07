<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const router = useRouter();
const route = useRoute();

const page = ref({ title: '제안 등록' });
const breadcrumbs = ref([
    { text: '제안 목록', disabled: false, href: '/proposals' },
    { text: '제안 등록', disabled: true, href: '/proposals/create' }
]);

const valid = ref(false);

const loading = ref(false);

const form = ref(null);

const editedItem = reactive({
    propNo: null,
    leadNo: null,
    leadName: '',
    name: '',
    reqDate: '',
    startDate: '',
    endDate: '',
    submitDate: '',
    prDate: '',
    note: '',
    cont: ''
});

const requiredFields = ref({
    name: false,
    leadName: false,
    reqDate: false,
    startDate: false,
    endDate: false,
    submitDate: false,
    prDate: false
});

const validateRequiredFields = () => {
    let isValid = true;

    for (const key in requiredFields.value) {
        if (!editedItem[key]) {
            requiredFields.value[key] = true;
            isValid = false;
        } else {
            requiredFields.value[key] = false;
        }
    }

    return isValid;
};

const leads = ref([]);
const leadModal = ref(false);
const leadDialog = ref(false);
const searchCond = reactive({
    selectedItem: '영업기회명',
    searchQuery: null
});
const headers = ref([
    { title: '영업기회명', key: 'leadName', sortable: false },
    { title: '고객명', key: 'customerName', sortable: false },
    { title: '담당자', key: 'userName', sortable: false }
]);
const leadList = ref([]);
const selectedLead = ref(null);

const handleRowClick = (lead) => {
    selectedLead.value = lead;
};

const handleRowDbClick = () => {
    if (selectedLead.value != null) {
        console.log('Selected Lead:', selectedLead.value);
        selectLead(selectedLead.value);
    } else {
        alert('영업기회를 선택하지 않았습니다.');
    }
};

const selectLead = (lead) => {
    editedItem.leadNo = lead.leadNo;
    editedItem.leadName = lead.name;
    console.log('Lead selected:', editedItem.leadNo);
    leadDialog.value = false;
};

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
watch(
    () => leadDialog.value,
    (newVal) => {
        if (newVal) {
            fetchLeads();
        } else {
            searchCond.searchQuery = '';
            selectedLead.value = null;
        }
    }
);

const fetchLeads = async () => {
    try {
        const response = await api.post('/leads/filter', searchCond);
        leadList.value = response.data.result;
    } catch (error) {
        console.error('영업기회 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const save = async () => {
    if (!validateRequiredFields()) {
        triggerAlert('모든 필수 항목을 입력해 주세요.', 'warning');
        return;
    }

    console.log('Edited Item before saving:', editedItem);

    loading.value = true;

    try {
        const res = await api.post('/proposals', editedItem);
        if (res.status === 200 || res.status === 201) {
            triggerAlert('제안이 추가되었습니다.', 'success', 2000, '/proposals');
        }
    } catch (error) {
        console.error('등록 실패:', error);
        triggerAlert('제안 등록에 실패했습니다.', 'error');
    } finally {
        loading.value = false;
    }
};

const cancel = () => {
    router.push('/proposals');
};
</script>
<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <div>
        <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

        <v-container>
            <UiParentCard title="제안등록">
                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">제안명<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.name"
                        :rules="[(v) => !!v || '제안명을 입력해주세요']"
                        required
                        outlined
                    ></v-text-field>
                </v-col>

                <!-- 영업기회 -->

                <v-dialog v-model="leadDialog" max-width="800">
                    <v-card>
                        <v-card-title class="headline"> 영업기회 조회</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="10">
                                    <v-text-field label="영업기회명" v-model="searchCond.searchQuery" clearable></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn @click="fetchLeads" color="primary">검색</v-btn>
                                </v-col>
                            </v-row>
                            <v-data-table
                                :headers="headers"
                                :items="leadList"
                                item-value="leadNo"
                                class="border rounded-md"
                                items-per-page="5"
                            >
                                <template v-slot:item="{ item }">
                                    <tr
                                        :class="{ 'highlighted-row': selectedLead && selectedLead.leadNo === item.leadNo }"
                                        @click="handleRowClick(item)"
                                        @dblclick="handleRowDbClick"
                                    >
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.customerName }}</td>
                                        <td>{{ item.userName }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="handleRowDbClick">선택</v-btn>

                            <v-btn color="error" @click="leadDialog = false">닫기</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">영업기회<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.leadName"
                        :rules="[(v) => !!v || '영업기회를 선택해주세요']"
                        append-inner-icon="mdi-magnify"
                        @click:append-inner="leadDialog = true"
                        class="clickable-field"
                        readonly
                    ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">요청일<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.reqDate"
                        type="date"
                        :rules="[(v) => !!v || '요청일을 선택해주세요']"
                        outlined
                    ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">제안 시작일<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.startDate"
                        type="date"
                        :rules="[(v) => !!v || '제안 시작일을 선택해주세요']"
                        outlined
                    ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">제안 종료일<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.endDate"
                        type="date"
                        :rules="[(v) => !!v || '제안 종료일을 선택해주세요']"
                        outlined
                    ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">제출일<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.submitDate"
                        type="date"
                        :rules="[(v) => !!v || '제출일을 선택해주세요']"
                        required
                        outlined
                    ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                    <v-label class="mb-2 font-weight-medium">발표일<span class="require">*</span></v-label>
                    <v-text-field
                        v-model="editedItem.prDate"
                        type="date"
                        :rules="[(v) => !!v || '발표일을 선택해주세요']"
                        outlined
                    ></v-text-field>
                </v-col>

                <v-col cols="12">
                    <v-label class="font-weight-medium mb-2">내용</v-label>
                    <v-textarea v-model="editedItem.cont" outlined></v-textarea>
                </v-col>

                <v-col cols="12">
                    <v-label class="font-weight-medium mb-2">비고</v-label>
                    <v-textarea v-model="editedItem.note" outlined></v-textarea>
                </v-col>

                <v-row justify="end">
                    <v-btn class="mr-2 mt-2" color="primary" variant="flat" style="font-size: 15px; font-weight: 600" @click="save"
                        >저장</v-btn
                    >
                    <v-btn class="mr-7 mt-2" color="primary" variant="outlined" style="font-size: 15px; font-weight: 600" @click="cancel"
                        >목록으로 돌아가기</v-btn
                    >
                </v-row>
            </UiParentCard>
        </v-container>
    </div>
</template>

<style>
.require {
    color: red;
}

.clickable-field {
    cursor: pointer;
}

.highlighted-row {
    background-color: #e0f7fa;
}
</style>
