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

        <v-data-table :headers="headers" :items="filteredContracts" class="elevation-0">
            <template v-slot:item.name="{ item }"> 
                <span
                    class="text-primary cursor-pointer"
                    @click="goToEditContractPage(item.contractNo)"
                >
                    {{ item.name }} 
                </span>
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
                { title: '계약 번호', key: 'contractNo' },
                { title: '계약 이름', key: 'name' },
                { title: '시작 날짜', key: 'startDate' },
                { title: '종료 날짜', key: 'endDate' },
                { title: '', key: 'action', sortable: false },
            ],
            showConfirmDialogs: false,
            selectedContractNo: null,
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
                const response = await api.get('/contract');
                this.contracts = response.data.result;
                this.applyFilter();
            } catch (error) {
                console.error('계약 목록을 가져오는 데 실패했습니다:', error);
                this.triggerAlert('계약 목록을 가져오는 데 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
            }
        },
        applyFilter() {
            this.filteredContracts = this.contracts.filter(contract => {
                return (
                    (this.filter.name ? contract.name.includes(this.filter.name) : true) &&
                    (this.filter.startDate ? new Date(contract.startDate) >= new Date(this.filter.startDate) : true) &&
                    (this.filter.endDate ? new Date(contract.endDate) <= new Date(this.filter.endDate) : true)
                );
            });
        },
        async confirmDeleteContract() {
            try {
                await api.delete(`/contract/${this.selectedContractNo}`);
                this.fetchContracts();        
                this.triggerAlert('계약이 삭제되었습니다.', 'success');
            } catch (error) {
                console.error('계약 삭제에 실패했습니다:', error);
                this.triggerAlert('계약 삭제에 실패했습니다. 다시 시도해 주세요.', 'error');
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
