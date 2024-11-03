<script setup>
import { computed, ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '../shared/AlertComponent.vue';

const showConfirmDialogs = ref(false); // 열림 상태 관리
const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const route = useRoute();
const router = useRouter();

const isMounted = ref(false);

const cardTitle = computed(() => {
    return route.path === '/sales/lead/new' ? '영업기회 등록' : '영업기회 정보';
});

const saveBtn = computed(() => {
    return route.path === '/sales/lead/new' ? '저장' : '수정';
});

const statuses = ref([
    { text: '선택', value: null },
    { text: '진행중', value: 'PROGRESS' },
    { text: '종료(실패)', value: 'FAIL' },
    { text: '종료(성공)', value: 'SUCCESS' },
    { text: '보류', value: 'HOLD' }
]);

const awarePathes = ref([
    { text: '선택', value: null },
    { text: '데모시연', value: 'DEMO' },
    { text: '교육', value: 'EDUCATION' },
    { text: '기존고객', value: 'EXISTING' },
    { text: '인터넷신문', value: 'NEWSPAPER' },
    { text: '파트너사', value: 'PARTNER' },
    { text: '인터넷검색', value: 'SEARCH' },
    { text: '기타', value: 'ETC' }
]);

const mapping = ref(false);
const leadResponseDto = reactive({
    leadNo: '',
    name: '',
    status: null,
    expSales: 0,
    expMargin: 0,
    expProfit: 0,
    process: 0,
    subProcess: 0,
    progressStep: '',
    successPer: 0,
    startDate: '',
    endDate: '',
    awarePath: null,
    note: '',
    customerNo: '',
    customerName: '',
    addr: '',
    userName: '',
    steps: []
});

const expSalesDisplay = ref('0');
const expProfitDisplay = ref('0');
const expMarginDisplay = ref('0');

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const filterNumericInput = (value) => {
    return value.replace(/[^\d]/g, '');
};

const state = reactive({
    processes: [],
    subProcesses: []
});

const today = new Date().toISOString().substring(0, 10);
leadResponseDto.startDate = today;
leadResponseDto.endDate = today;

const customerDialog = ref(false);
const searchCond = reactive({
    selectedItem: '고객명',
    searchQuery: null
});
const customerList = ref([]);
const selectedCustomer = ref(null);

const headers = ref([
    { title: '고객사', key: 'company', sortable: false },
    { title: '이름', key: 'name', sortable: false },
    { title: '부서', key: 'dept', sortable: false },
    { title: '직책', key: 'position', sortable: false },
    { title: '담당자', key: 'userName', sortable: false }
]);

const fetchCustomers = async () => {
    try {
        const response = await api.post('/customers/search', searchCond);
        customerList.value = response.data.result;
    } catch (error) {
        console.error('고객 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const selectCustomer = (customer) => {
    leadResponseDto.customerNo = customer.customerNo;
    leadResponseDto.customerName = customer.name;
    leadResponseDto.userName = customer.userName;
    customerDialog.value = false;
};

const handleRowClick = (customer) => {
    selectedCustomer.value = customer;
};

const handleRowDblClick = () => {
    if (selectedCustomer.value != null) {
        selectCustomer(selectedCustomer.value);
    } else {
        alert('고객을 선택하지 않았습니다!');
    }
};

const fetchLeadDetails = async (leadNo) => {
    try {
        const response = await api.get(`/leads/${leadNo}`);
        const result = response.data.result;

        leadResponseDto.leadNo = result.leadNo;
        leadResponseDto.name = result.name;
        leadResponseDto.status = result.status;
        leadResponseDto.expSales = result.expSales;
        leadResponseDto.expMargin = result.expMargin;
        leadResponseDto.expProfit = result.expProfit;
        leadResponseDto.process = result.process;
        leadResponseDto.subProcess = result.subProcess;
        leadResponseDto.successPer = result.successPer;
        leadResponseDto.startDate = result.startDate;
        leadResponseDto.endDate = result.endDate;
        leadResponseDto.awarePath = result.awarePath;
        leadResponseDto.note = result.note;
        leadResponseDto.customerNo = result.customerNo;
        leadResponseDto.customerName = result.customerName;
        leadResponseDto.userName = result.userName;
        leadResponseDto.steps = result.steps;

        fetchSubProcesses(leadResponseDto.process);

        mapping.value = true;
    } catch (error) {
        console.error('lead 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const fetchProcesses = async () => {
    try {
        const response = await api.get(`/admin/processes`);
        state.processes = response.data.result;

        const leadNo = route.params.no;
        if (leadNo != null && leadNo != '' && leadNo != 'undefined') {
            fetchLeadDetails(leadNo);
        } else {
            isMounted.value = true;
            leadResponseDto.process = state.processes[0].processNo;
        }
    } catch (error) {
        console.error('process 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const getProcessNameByNo = (processNo) => {
    const process = state.processes.find((p) => p.processNo === processNo);
    return process ? process.processName : '';
};

const fetchSubProcesses = async (processNo) => {
    try {
        const processName = getProcessNameByNo(processNo);
        const response = await api.get(`/admin/subprocesses/${processName}`);

        state.subProcesses = response.data.result;

        if (!isMounted.value) {
            leadResponseDto.progressStep = state.subProcesses.find((s) => s.subProcessNo === leadResponseDto.subProcess).progressStep;
        } else {
            leadResponseDto.subProcess = state.subProcesses[0].subProcessNo;
        }

        isMounted.value = true;
    } catch (error) {
        console.error('subProcess 데이터를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const requiredRule = (value) => !!value || '필수 입력 항목입니다.';

const leadFormValid = ref(false);

const submitForm = async () => {
    if (leadFormValid.value) {
        try {
            let response;

            if (!leadResponseDto.leadNo) {
                response = await api.post('/leads', {
                    name: leadResponseDto.name,
                    status: leadResponseDto.status,
                    expSales: leadResponseDto.expSales,
                    expMargin: leadResponseDto.expMargin,
                    expProfit: leadResponseDto.expProfit,
                    process: leadResponseDto.process,
                    subProcess: leadResponseDto.subProcess,
                    successPer: leadResponseDto.successPer,
                    startDate: leadResponseDto.startDate,
                    endDate: leadResponseDto.endDate,
                    awarePath: leadResponseDto.awarePath,
                    note: leadResponseDto.note,
                    custNo: leadResponseDto.customerNo
                });

                console.log('POST response:', response.data);

                if (response.data.isSuccess) {
                    leadResponseDto.leadNo = response.data.result.leadNo;
                    triggerAlert('저장이 완료되었습니다.', 'success', 1500, '/sales/lead');
                }
            } else {
                response = await api.patch(`/leads/${leadResponseDto.leadNo}`, {
                    name: leadResponseDto.name,
                    status: leadResponseDto.status,
                    expSales: leadResponseDto.expSales,
                    expMargin: leadResponseDto.expMargin,
                    expProfit: leadResponseDto.expProfit,
                    process: leadResponseDto.process,
                    subProcess: leadResponseDto.subProcess,
                    successPer: leadResponseDto.successPer,
                    startDate: leadResponseDto.startDate,
                    endDate: leadResponseDto.endDate,
                    awarePath: leadResponseDto.awarePath,
                    note: leadResponseDto.note,
                    custNo: leadResponseDto.customerNo
                });

                console.log('PATCH response:', response.data);

                if (response.data.isSuccess) {
                    triggerAlert('수정이 완료되었습니다.', 'success', 1500, '/sales/lead');
                }
            }
        } catch (error) {
            console.error('데이터 전송 중 오류가 발생했습니다:', error);
            triggerAlert('저장에 실패했습니다.', 'error');
        }
    } else {
        console.log('입력 값이 정상적이지 않습니다.');
        triggerAlert('필수값이 입력되지 않았습니다.', 'warning');
    }
};

const deleteDialog = ref(false);

const deleteLead = async () => {
    const leadNo = leadResponseDto.leadNo;
    showConfirmDialogs.value = false;
    if (leadNo) {
        try {
            await api.delete(`/leads/${leadNo}`);
            console.log(`리드 ${leadNo}가 성공적으로 삭제되었습니다.`);

            triggerAlert('삭제가 완료되었습니다.', 'success', 1000, '/sales/lead');
        } catch (error) {
            console.error('삭제 중 오류가 발생했습니다:', error);
            triggerAlert('삭제에 실패했습니다.', 'error');
        }
    } else {
        console.warn('리드 번호가 없습니다. 삭제할 수 없습니다.');
    }
};

const updateExpSales = (e) => {
    const rawValue = filterNumericInput(e.target.value);
    leadResponseDto.expSales = parseInt(rawValue) || 0;
    expSalesDisplay.value = formatNumber(leadResponseDto.expSales);
};

const updateExpProfit = (e) => {
    const rawValue = filterNumericInput(e.target.value);
    leadResponseDto.expProfit = parseInt(rawValue) || 0;
    expProfitDisplay.value = formatNumber(leadResponseDto.expProfit);
};

const updateExpMargin = (e) => {
    const rawValue = filterNumericInput(e.target.value);
    leadResponseDto.expMargin = parseInt(rawValue) || 0;
    expMarginDisplay.value = formatNumber(leadResponseDto.expMargin);
};

const getStepColor = (step) => {
    if (step.completeYn == 'Y') {
        switch (step.level) {
            case 0:
                return 'error';
            case 1:
                return 'warning';
            case 2:
                return 'success';
            case 3:
                return 'secondary';
            case 4:
                return 'primary';
        }
    }
    return 'grey lighten-2';
};

const checkMaxSuccessPer = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 100) {
        leadResponseDto.successPer = 100;
    } else if (value < 0) {
        leadResponseDto.successPer = 0;
    } else {
        leadResponseDto.successPer = value || 0;
    }
};

watch(
    () => leadResponseDto.subProcess,
    (newSubProcess) => {
        if (isMounted.value) {
            const selectedSubProcess = state.subProcesses.find((s) => s.subProcessNo === newSubProcess);

            if (selectedSubProcess) {
                leadResponseDto.progressStep = selectedSubProcess.progressStep;
                leadResponseDto.successPer = selectedSubProcess.successRate;
            }
        }
    }
);

watch(
    () => leadResponseDto.process,
    (newProcess) => {
        if (isMounted.value) {
            if (newProcess) {
                fetchSubProcesses(newProcess);
            }
        }
    }
);

watch(
    () => leadResponseDto.expSales,
    (newVal) => {
        if (isMounted.value) {
            leadResponseDto.expProfit = Math.floor((newVal * leadResponseDto.expMargin) / 100);
        }
        expSalesDisplay.value = formatNumber(newVal);
    }
);

watch(
    () => leadResponseDto.expMargin,
    (newVal) => {
        if (isMounted.value) {
            leadResponseDto.expProfit = Math.floor((newVal * leadResponseDto.expSales) / 100);
        }
        expMarginDisplay.value = formatNumber(newVal);
    }
);

watch(
    () => leadResponseDto.expProfit,
    (newVal) => {
        expProfitDisplay.value = formatNumber(newVal);
    }
);

watch(
    () => customerDialog.value,
    (newVal) => {
        if (newVal) {
            fetchCustomers();
        } else {
            searchCond.searchQuery = '';
            selectedCustomer.value = null;
        }
    }
);

onMounted(() => {
    fetchProcesses();
});
</script>

<template>
    <v-card elevation="10">
        <ConfirmDialogs :dialog="showConfirmDialogs" @agree="deleteLead" @disagree="() => (showConfirmDialogs = false)" />

        <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />

        <v-dialog v-model="customerDialog" max-width="800">
            <v-card>
                <v-card-title class="headline"> 고객 조회 </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="10">
                            <v-text-field label="고객/고객사" v-model="searchCond.searchQuery" clearable></v-text-field>
                        </v-col>
                        <v-col cols="2">
                            <v-btn @click="fetchCustomers" color="primary">검색</v-btn>
                        </v-col>
                    </v-row>
                    <v-data-table
                        :headers="headers"
                        :items="customerList"
                        item-value="customerNo"
                        class="border rounded-md"
                        items-per-page="5"
                    >
                        <template v-slot:item="{ item }">
                            <tr
                                :class="{ 'highlighted-row': selectedCustomer && selectedCustomer.customerNo === item.customerNo }"
                                @click="handleRowClick(item)"
                                @dblclick="handleRowDblClick"
                            >
                                <td>{{ item.company }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.dept }}</td>
                                <td>{{ item.position }}</td>
                                <td>{{ item.userName }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="handleRowDblClick">선택</v-btn>
                    <v-btn color="error" @click="customerDialog = false">닫기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-card-item class="py-4 px-6">
            <div class="d-sm-flex align-center justify-space-between">
                <v-card-title class="text-h5">{{ cardTitle }}</v-card-title>
            </div>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text>
            <v-form v-model="leadFormValid">
                <v-row>
                    <v-col cols="12" lg="12">
                        <v-row>
                            <v-col v-if="leadResponseDto.steps && leadResponseDto.steps.length > 0" cols="12">
                                <v-row>
                                    <v-col v-for="step in leadResponseDto.steps" :key="step.stepNo" cols="auto">
                                        <v-chip :color="getStepColor(step)" class="white--text">
                                            {{ step.subProcessName }}
                                            <span v-if="step.completeYn == 'Y'"> {{ step.completeDate }}</span>
                                        </v-chip>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="12">
                                <v-label class="mb-2 font-weight-medium">영업기회명<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="leadResponseDto.name"
                                    variant="outlined"
                                    color="primary"
                                    :rules="[requiredRule]"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">고객<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="leadResponseDto.customerName"
                                    :rules="[requiredRule]"
                                    variant="outlined"
                                    color="primary"
                                    readonly
                                    append-inner-icon="mdi-magnify"
                                    @click:append-inner="customerDialog = true"
                                ></v-text-field>
                                <v-label class="mb-2 font-weight-medium">예상매출(원)</v-label>
                                <v-text-field
                                    v-model="expSalesDisplay"
                                    variant="outlined"
                                    color="primary"
                                    maxlength="14"
                                    @input="updateExpSales"
                                ></v-text-field>
                                <v-label class="mb-2 font-weight-medium">예상이익금액(원)</v-label>
                                <v-text-field
                                    v-model="expProfitDisplay"
                                    variant="outlined"
                                    color="primary"
                                    @input="updateExpProfit"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">진행상태<span class="require">*</span></v-label>
                                <v-select
                                    v-model="leadResponseDto.status"
                                    :items="statuses"
                                    item-props="true"
                                    item-title="text"
                                    item-value="value"
                                    :rules="[requiredRule]"
                                    variant="outlined"
                                ></v-select>
                                <v-label class="mb-2 font-weight-medium">예상이익률(%)</v-label>
                                <v-text-field
                                    v-model="expMarginDisplay"
                                    variant="outlined"
                                    color="primary"
                                    maxlength="3"
                                    @input="updateExpMargin"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="3">
                                <v-label class="mb-2 font-weight-medium">프로세스<span class="require">*</span></v-label>
                                <v-select
                                    v-model="leadResponseDto.process"
                                    :items="state.processes"
                                    item-props="true"
                                    item-title="processName"
                                    item-value="processNo"
                                    :rules="[requiredRule]"
                                    variant="outlined"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-label class="mb-2 font-weight-medium">단계<span class="require">*</span></v-label>
                                <v-select
                                    v-model="leadResponseDto.subProcess"
                                    :items="state.subProcesses"
                                    item-props="true"
                                    item-title="subProcessName"
                                    item-value="subProcessNo"
                                    :rules="[requiredRule]"
                                    variant="outlined"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-label class="mb-2 font-weight-medium">카테고리</v-label>
                                <v-text-field
                                    v-model="leadResponseDto.progressStep"
                                    readonly
                                    variant="outlined"
                                    color="primary"
                                    :disabled="true"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-label class="mb-2 font-weight-medium">성공확률(%)</v-label>
                                <v-text-field
                                    v-model="leadResponseDto.successPer"
                                    variant="outlined"
                                    @input="checkMaxSuccessPer"
                                    color="primary"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-label class="mb-2 font-weight-medium">영업시작일</v-label>
                        <v-text-field v-model="leadResponseDto.startDate" color="primary" variant="outlined" type="date"></v-text-field>
                        <v-label class="mb-2 font-weight-medium">인지경로</v-label>
                        <v-select
                            v-model="leadResponseDto.awarePath"
                            :items="awarePathes"
                            item-props="true"
                            item-title="text"
                            item-value="value"
                            variant="outlined"
                        ></v-select>
                        <div class="hidden-field">
                            <v-label class="mb-2 font-weight-medium">주소</v-label>
                            <v-text-field v-model="leadResponseDto.addr" variant="outlined" color="primary"></v-text-field>
                            <v-text-field variant="outlined" color="primary" placeholder="상세 주소"></v-text-field>
                        </div>
                        <v-btn color="primary" class="mr-2" flat @click="submitForm">{{ saveBtn }}</v-btn>
                        <v-btn v-if="saveBtn == '수정'" color="error" class="mr-2" @click="showConfirmDialogs = true">삭제</v-btn>
                        <v-btn class="ml-" variant="outlined" color="primary" to="/sales/lead">목록으로 돌아가기</v-btn>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-label class="mb-2 font-weight-medium">영업종료일</v-label>
                        <v-text-field v-model="leadResponseDto.endDate" color="primary" variant="outlined" type="date"></v-text-field>
                        <v-label class="mb-2 font-weight-medium">담당자</v-label>
                        <v-text-field v-model="leadResponseDto.userName" variant="outlined" color="primary"></v-text-field>
                        <v-label class="font-weight-medium mb-2">비고</v-label>
                        <v-textarea
                            v-model="leadResponseDto.note"
                            auto-grow
                            rows="3"
                            color="primary"
                            row-height="25"
                            shaped
                            hide-details
                        ></v-textarea>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<style>
.hidden-field {
    visibility: hidden;
}

.require {
    color: red;
}

.headline {
    font-size: 18px;
    font-weight: bold;
}

.highlighted-row {
    background-color: #e0f7fa; /* 선택된 행 강조 표시 */
}
</style>
