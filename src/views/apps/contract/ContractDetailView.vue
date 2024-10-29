<script>
import api from '@/api/axiosinterceptor';
import ContractModal from './ContractModal.vue';

export default {
    components: { ContractModal },
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
                { title: '추가 작업', key: 'action', sortable: false },
            ],
            showModal: false,
            editedContract: {
                contractNo: null,
                name: '',
                startDate: '',
                endDate: '',
                taxCls: '',
                surtaxYn: '',
                prodCnt: 0,
                supplyPrice: 0,
                tax: 0,
                price: 0,
                paymentTerms: '',
                warranty: 0,
                cls: '',
                expArrivalDate: '',
                arrivalNotiYn: '',
                arrivalNotiDay: 0,
                renewalNotiYn: '',
                renewalNotiDay: 0,
                note: '',
                estimateNo: '',
            },
        };
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
                this.applyFilter(); // Fetch 후 필터 적용
            } catch (error) {
                console.error('계약 목록을 가져오는 데 실패했습니다:', error);
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
        async deleteContract(contractNo) {
            if (confirm('정말로 이 계약을 삭제하시겠습니까?')) {
                try {
                    await api.delete(`/contract/${contractNo}`);
                    this.fetchContracts();
                    alert('계약이 삭제되었습니다.');
                } catch (error) {
                    console.error('계약 삭제에 실패했습니다:', error);
                    alert('계약 삭제에 실패했습니다.');
                }
            }
        },
        editContract(contract) {
            this.editedContract = { ...contract };
            this.showModal = true;
        },
        openModal() {
            this.editedContract = {
                contractNo: null,
                name: '',
                startDate: '',
                endDate: '',
                taxCls: '',
                surtaxYn: '',
                prodCnt: 0,
                supplyPrice: 0,
                tax: 0,
                price: 0,
                paymentTerms: '',
                warranty: 0,
                cls: '',
                expArrivalDate: '',
                arrivalNotiYn: '',
                arrivalNotiDay: 0,
                renewalNotiYn: '',
                renewalNotiDay: 0,
                note: '',
                estimateNo: '',
            };
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        async saveContract(contract) {
            try {
                if (contract.contractNo) {
                    await api.patch(`/contract/${contract.contractNo}`, contract);
                } else {
                    await api.post('/contract', contract);
                }
                this.fetchContracts();
                this.closeModal();
                // alert('계약이 저장되었습니다.'); 
            } catch (error) {
                console.error('계약 저장에 실패했습니다:', error);
            }
        }
    },
};
</script>

<template>
    <div>
        <v-row>
            <v-col>
                <div>총 견적 개수: {{ filteredContracts.length }}개</div>
            </v-col>
            <v-col cols="12" lg="12" md="6" class="text-right">
                <v-btn color="primary" @click="openModal" flat class="ml-auto">
                    <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>계약 생성
                </v-btn>
            </v-col>
        </v-row>

        <v-data-table :headers="headers" :items="filteredContracts" class="elevation-0">
            <template v-slot:item.action="{ item }">
                <v-btn @click="editContract(item)" style="color: slateblue">수정</v-btn>
                <v-btn @click="deleteContract(item.contractNo)" style="color: crimson">삭제</v-btn>
            </template>
            <template v-slot:no-data>
                <v-alert type="info">데이터가 없습니다.</v-alert>
            </template>
        </v-data-table>

        <ContractModal
            v-model="showModal"
            :contract="editedContract"
            @save="saveContract"
            @close="closeModal"
        />
    </div>
</template>
