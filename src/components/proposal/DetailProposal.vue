<script setup>
import { ref, watch, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import api from '@/api/axiosinterceptor';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const showConfirmDialogs = ref(false);
const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => (route.params.propNo ? '제안 수정' : '제안 추가'));
const pagePath = computed(() => (route.params.propNo ? `/proposals/${route.params.propNo}` : 'proposals/create'));
const saveBtn = computed(() => (route.params.propNo ? '수정' : '저장'));

const page = ref({ title: pageTitle });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '제안', disabled: false, href: '#' },
    { text: '제안 목록', disabled: false, href: '/proposals' },
    { text: pageTitle, disabled: true, href: pagePath }
]);

const valid = ref(false);

const loading = ref(false);

const form = ref(null);

const editedItem = reactive({
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
    note: '',
    cont: ''
});

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
    console.log('Lead selected:', editedItem);
    leadDialog.value = false;
};

onMounted(async () => {
    if (route.params.propNo) {
        try {
            const response = await api.get(`/proposals/${route.params.propNo}`);
            if (response.data.isSuccess) {
                Object.assign(editedItem, response.data.result);
            } else {
                console.error('Failed to fetch proposal details');
            }
        } catch (error) {
            console.error('Error fetching proposal details:', error);
            triggerAlert('제안 정보를 불러오는 데 실패했습니다.', 'error');
        }
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
            leadList.value = [];
        }
    }
);

const displayedLeads = computed(() => leads.value);
const leadName = ref('');

const fetchLeads = async () => {
    console.log('Searching leads with:', searchCond);
    try {
        const response = await api.post('/leads/filter', {
            name: searchCond.searchQuery || undefined
        });
        if (response.data.isSuccess) {
            leads.value = response.data.result;
        } else {
            console.error('Error fetching leads:', response.data);
        }
    } catch (error) {
        console.error('Failed to search leads:', error);
        triggerAlert('검색에 실패했습니다.', 'error');
    }
};

const dialogEdit = ref(false);
const updateProposalApi = async () => {
    try {
        const res = await api.patch(`/proposals/${editedItem.propNo}`, editedItem);
        if (res.status === 200) {
            triggerAlert('제안이 수정되었습니다.', 'success', 2000, '/proposals');
        }
    } catch (error) {
        console.error('수정 실패:', error);
        triggerAlert('제안 수정에 실패했습니다.', 'error');
    }
};

const initialize = async () => {
    console.log('Initializing or refreshing data');
};

const deleteProposalApi = async () => {
    const propNo = editedItem.propNo;
    showConfirmDialogs.value = false;

    if (propNo != null) {
        try {
            const response = await api.delete(`/proposals/${propNo}`);

            if (response.data.isSuccess) {
                triggerAlert('제안이 삭제되었습니다.', 'success');
                setTimeout(() => router.push('/proposals'), 1500);
            } else {
                triggerAlert(response.data.message || '삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            triggerAlert('제안 삭제에 실패했습니다.', 'error');
        }
    } else {
        triggerAlert('제안번호가 존재하지 않습니다.', 'warning');
    }
};

const save = async () => {
    if (form.value) {
        const isValid = await form.value.validate();
        if (!isValid) {
            triggerAlert('유효한 값을 입력해주세요.', 'error');
            return;
        }
    }
    loading.value = true;

    try {
        if (editedItem.propNo) {
            await updateProposalApi();
        } else {
            const res = await api.post('/proposals', editedItem);
            if (res.status === 200 || res.status === 201) {
                triggerAlert('제안이 추가되었습니다.', 'success', 2000, '/proposals');
            }
        }
    } catch (error) {
        console.error('저장 실패:', error);
        triggerAlert('제안 저장에 실패했습니다.', 'error');
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
            <UiParentCard :title="route.params.propNo ? '제안 수정' : '제안 추가'">
                <v-form ref="form" v-model="valid" @submit.prevent="save">
                    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
                    <ConfirmDialogs
                        :dialog="showConfirmDialogs"
                        @agree="deleteProposalApi"
                        @disagree="() => (showConfirmDialogs = false)"
                    />

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
                                    :key="leads.length"
                                    :headers="headers"
                                    :items="displayedLeads"
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
                        <v-btn class="mr-2 mt-2" color="primary" variant="flat" style="font-size: 15px; font-weight: 600" @click="save">
                            {{ saveBtn }}
                        </v-btn>

                        <v-btn color="error" class="mr-2 mt-2" @click="showConfirmDialogs = true">삭제</v-btn>
                        <v-btn
                            class="mr-7 mt-2"
                            color="primary"
                            variant="outlined"
                            style="font-size: 15px; font-weight: 600"
                            @click="cancel"
                            >목록으로 돌아가기</v-btn
                        >
                    </v-row>
                </v-form>
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
