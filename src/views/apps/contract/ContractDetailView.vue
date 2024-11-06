<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <div>
        <v-row>
            <v-col>
                <div>총 계약 개수: {{ filteredContracts.length }}개</div>
            </v-col>
            <v-col cols="12" lg="12" md="6" class="text-right">
                <v-btn color="primary" variant="tonal" @click="goToCreateContractPage" flat class="ml-auto"> 계약 생성 </v-btn>
            </v-col>
        </v-row>
        <v-card-text v-if="loadingEstimates">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-card-text>
        <v-card-text v-else>
            <v-data-table 
                :headers="headers" 
                :items="filteredContracts" 
                class="elevation-0" 
                :items-per-page="5" 
                :search="filter.name" 
                @update:search="filter.name = $event"
            >
                <template v-slot:item.name="{ item }"> 
                    <span
                        class="text-primary cursor-pointer"
                        @click="goToEditContractPage(item.contractNo)"
                    >
                        {{ item.name }} 
                    </span>
                </template>

                <template v-slot:item.estimateName="{ item }">
                    <span>{{ item.estimateName }}</span>
                </template>

                <template v-slot:item.action="{ item }">
                    <div class="d-flex gap-2">
                        <EditIcon
                            height="20"
                            width="20"
                            class="text-primary cursor-pointer"
                            size="small"
                            @click="goToEditContractPage(item.contractNo)"
                        />
                        <TrashIcon
                            height="20"
                            width="20"
                            class="text-error cursor-pointer"
                            size="small"
                            @click="deleteContract(item.contractNo)"
                        />
                    </div>
                </template>

                <template v-slot:no-data>
                    <v-alert type="info">데이터가 없습니다.</v-alert>
                </template>
            </v-data-table>
        </v-card-text>
        
        <ConfirmDialogs :dialog="showConfirmDialogs" @agree="confirmDeleteContract" @disagree="showConfirmDialogs = false" />
    </div>
</template>

<script>
import api from '@/api/axiosinterceptor';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import { useRouter } from 'vue-router';

export default {
    components: { ConfirmDialogs, AlertComponent },
    props: {
        filter: {
            type: Object,
            default: () => ({
                name: '',
                startDate: '',
                endDate: ''
            }),
        },
    },
    data() {
        return {
            contracts: [],
            filteredContracts: [],
            headers: [
                { title: '계약명', key: 'name' },
                { title: '견적명', key: 'estimateName' },  
                { title: '계약 날짜', key: 'contractDate' },
                { title: '', key: 'action', sortable: false },
            ],
            showConfirmDialogs: false,
            selectedContractNo: null,
            loadingEstimates: false,
        };
    },
    setup() {
        const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();
        const router = useRouter();
        return { alertMessage, alertType, showAlert, triggerAlert, router };
    },
    mounted() {
        this.fetchContracts();
    },
    watch: {
        filter: {
            immediate: true,
            handler() {
                this.applyFilter();
            },
        },
    },
    methods: {
        async fetchContracts() {
            try {
                this.loadingEstimates = true;
                const response = await api.get('/contract');
                this.contracts = response.data.result;

                await Promise.all(this.contracts.map(async (contract) => {
                    if (contract.estimateNo) {
                        try {
                            const estimateResponse = await api.get(`/estimates/${contract.estimateNo}`);
                            contract.estimateName = estimateResponse.data.result.name;
                        } catch (error) {
                            console.error(`견적 번호 ${contract.estimateNo}에 대한 정보를 가져오는 데 실패했습니다:`, error);
                            contract.estimateName = '견적명을 찾을 수 없습니다';
                        }
                    } else {
                        contract.estimateName = '견적번호 없음';
                    }
                }));

                this.applyFilter();
            } catch (error) {
                console.error('계약 목록을 가져오는 데 실패했습니다:', error);
            } finally {
                this.loadingEstimates = false;
            }
        },
        applyFilter() {
            this.filteredContracts = this.contracts.filter(contract => {
                return (
                    (this.filter.name ? contract.name.includes(this.filter.name) : true) &&
                    (this.filter.startDate ? new Date(contract.contractDate) >= new Date(this.filter.startDate) : true) &&
                    (this.filter.endDate ? new Date(contract.contractDate) <= new Date(this.filter.endDate) : true)
                );
            });
        },
        async confirmDeleteContract() {
            try {
                await api.delete(`/contract/${this.selectedContractNo}`);
                this.fetchContracts();        
            } catch (error) {
                console.error('계약 삭제에 실패했습니다:', error);
            } finally {
                this.showConfirmDialogs = false;
            }
        },
        deleteContract(contractNo) {
            this.selectedContractNo = contractNo;
            this.showConfirmDialogs = true;
        },
        goToCreateContractPage() {
            window.location.href = '/apps/contract/edit'; 
        },
        goToEditContractPage(contractNo) {
            window.location.href = `/apps/contract/edit/${contractNo}`; 
        },
    },
};
</script>
