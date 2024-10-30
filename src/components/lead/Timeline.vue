<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/axiosinterceptor';
import { reverseActStatus } from '@/utils/ActStatusMappings';

const route = useRoute();

import {
    AddressBookIcon,
    FileDescriptionIcon,
    MicrophoneIcon,
    CalculatorIcon,
    BusinessplanIcon,
    HeartHandshakeIcon
} from 'vue-tabler-icons';

const lead = reactive([]);
const acts = reactive([]);
const proposal = reactive([]);
const estimate = reactive([]);
const contract = reactive([]);
const sales = reactive([]);

const fetchData = async (leadNo) => {
    try {
        const [leadRes, actRes, proposalRes, estimateRes, contractRes, salesRes] = await Promise.all([
            api.get(`/leads/${leadNo}`),
            api.get(`/acts/timeline/${leadNo}`),
            api.get(`/proposals/timeline/${leadNo}`),
            api.get(`/estimates/timeline/${leadNo}`),
            api.get(`/contract/timeline/${leadNo}`),
            api.get(`/sales/timeline/${leadNo}`)
        ]);

        lead.value = leadRes.data.result;
        acts.values = actRes.data.result;
        proposal.value = proposalRes.data.result;
        estimate.value = estimateRes.data.result;
        contract.value = contractRes.data.result;
        sales.value = salesRes.data.result;
    } catch (error) {
        console.error('타임라인 데이터를 조화하는데 실패했습니다.', error);
    }
};

const formatCurrency = (value) => {
    return value.toLocaleString(); // 천 단위 구분을 추가
};

onMounted(() => {
    const leadNo = route.params.no;

    if (leadNo != null) {
        fetchData(leadNo);
    }
});
</script>
<template>
    <VCard elevation="10">
        <v-card-text>
            <div class="profiletimeline position-relative">
                <div v-if="sales.value != null">
                    <div class="sl-item mt-2 mb-3">
                        <div class="sl-left float-left me-3">
                            <component :is="BusinessplanIcon" stroke-width="1.5" size="40" />
                        </div>
                        <div class="sl-right">
                            <div>
                                <div class="d-md-flex">
                                    <h3 class="text-h6">매출</h3>
                                    <div class="sl-date text-muted ms-1">{{ sales.value.salesDate }}</div>
                                </div>
                                <v-alert class="mt-4 fs-3" color="secondary" variant="tonal">
                                    {{ sales.value.salesName }}<br />
                                    KRW {{ formatCurrency(sales.value.supplyPrice) }}
                                </v-alert>
                            </div>
                        </div>
                    </div>
                    <v-divider></v-divider>
                </div>
                <div v-if="contract.value != null">
                    <div class="sl-item my-4 border-top pt-4">
                        <div class="sl-left float-left me-3">
                            <component :is="HeartHandshakeIcon" stroke-width="1.5" size="40" />
                        </div>
                        <div class="sl-right">
                            <div>
                                <div class="d-md-flex">
                                    <h3 class="text-h6">계약</h3>
                                    <div class="sl-date text-muted ms-1">{{ contract.value.contractDate }}</div>
                                </div>
                                <v-alert class="mt-4 fs-3" color="primary" variant="tonal">
                                    {{ contract.value.name }}<br />
                                    {{ contract.value.startDate }} ~ {{ contract.value.endDate }}<br />
                                    KRW {{ formatCurrency(contract.value.supplyPrice) }}
                                </v-alert>
                            </div>
                        </div>
                    </div>
                    <v-divider></v-divider>
                </div>
                <div v-if="estimate.value != null">
                    <div class="sl-item my-4 border-top pt-4">
                        <div class="sl-left float-left me-3">
                            <component :is="CalculatorIcon" stroke-width="1.5" size="40" />
                        </div>
                        <div class="sl-right">
                            <div>
                                <div class="d-md-flex">
                                    <h3 class="text-h6">견적</h3>
                                    <div class="sl-date text-muted ms-1">{{ estimate.value.estDate }}</div>
                                </div>
                                <v-alert class="mt-3 fs-3" color="secondary" variant="tonal">
                                    {{ estimate.value.name }}<br />
                                    KRW {{ formatCurrency(estimate.value.supplyPrice) }}
                                </v-alert>
                            </div>
                        </div>
                    </div>
                    <v-divider></v-divider>
                </div>
                <div v-if="proposal.value != null">
                    <div class="sl-item my-4 border-top pt-4">
                        <div class="sl-left float-left me-3">
                            <component :is="MicrophoneIcon" stroke-width="1.5" size="40" />
                        </div>
                        <div class="sl-right">
                            <div>
                                <div class="d-md-flex">
                                    <h3 class="text-h6">제안</h3>
                                    <div class="sl-date text-muted ms-1">{{ proposal.value.prDate }}</div>
                                </div>
                                <v-alert class="mt-3 fs-3" color="primary" variant="tonal">
                                    {{ proposal.value.name }}<br />
                                    {{ proposal.value.startDate }} ~ {{ proposal.value.endDate }}
                                </v-alert>
                            </div>
                        </div>
                    </div>
                    <v-divider></v-divider>
                </div>
                <div v-if="acts.values != null">
                    <div v-for="(act, actNo) in acts.values" :key="actNo">
                        <div class="sl-item my-4 border-top pt-4">
                            <div class="sl-left float-left me-3">
                                <component :is="FileDescriptionIcon" stroke-width="1.5" size="40" />
                            </div>
                            <div class="sl-right">
                                <div>
                                    <div class="d-md-flex">
                                        <h3 class="text-h6">영업활동</h3>
                                        <div class="sl-date text-muted ms-1">{{ act.actDate }}</div>
                                    </div>
                                    <v-alert class="mt-3 fs-3" color="secondary" variant="tonal">
                                        {{ act.name }}<br />
                                        {{ lead.value.customerName }}<br />
                                        {{ reverseActStatus[act.cls] || act.cls }} / {{ act.purpose }} / {{ lead.value.userName }}
                                    </v-alert>
                                </div>
                            </div>
                        </div>
                        <v-divider></v-divider>
                    </div>
                </div>
                <div v-if="lead.value != null">
                    <div class="sl-item my-4 border-top pt-4">
                        <div class="sl-left float-left me-3">
                            <component :is="AddressBookIcon" stroke-width="1.5" size="40" />
                        </div>
                        <div class="sl-right">
                            <div>
                                <div class="d-md-flex">
                                    <h3 class="text-h6">영업기회 등록</h3>
                                    <div class="sl-date text-muted ms-1">{{ lead.value.startDate }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-text>
    </VCard>
</template>

<style lang="scss">
.profiletimeline {
    position: relative;
    padding-left: 40px;
    margin: 10px 10px 0 30px;
    border-left: 1px solid rgb(var(--v-theme-inputBorder));
    .sl-item {
        margin-top: 8px;
        margin-bottom: 30px;
        display: flex;
    }
    .sl-left {
        margin-left: -60px;
        z-index: 1;
        margin-right: 15px;
    }
}
</style>
