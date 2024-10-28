
<script>
import api from '@/api/axiosinterceptor';
import ContractModal from './ContractModal.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';

export default {
    components: { ContractModal, ConfirmDialogs },
    data() {
        return {
            contracts: [],
            headers: [
                { title: '계약 번호', key: 'contractNo' },
                { title: '계약 이름', key: 'name' },
                { title: '시작 날짜', key: 'startDate' },
                { title: '종료 날짜', key: 'endDate' },
                { title: '', key: 'action', sortable: false },
            ],
            showModal: false,
            showConfirmDialogs: false,
            selectedContractNo: null, // 삭제할 계약 번호 저장해놓고 공유하기
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
            search: '',
        };
    },
    mounted() {
        this.fetchContracts();
    },
    methods: {
        async fetchContracts() {
            try {
                const response = await api.get('/contract');
                this.contracts = response.data.result;
            } catch (error) {
                console.error('계약 목록을 가져오는 데 실패했습니다:', error);
            }
        },
        async confirmDeleteContract() {
            try {
                await api.delete(`/contract/${this.selectedContractNo}`);
                this.fetchContracts();
                alert('계약이 삭제되었습니다.');
            } catch (error) {
                console.error('계약 삭제에 실패했습니다:', error);
                alert('계약 삭제에 실패했습니다.');
            } finally {
                this.showConfirmDialogs = false;
            }
        },
        async deleteContract(contractNo) {
            this.selectedContractNo = contractNo;
            this.showConfirmDialogs = true;
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
            } catch (error) {
                console.error('계약 저장에 실패했습니다:', error);
            }
        },
    },
};
</script>


<template>
    <div>
        <v-row>
            <v-col><div >총 견적 개수: {{ contracts.length }}개</div> </v-col>
            <v-col cols="12" lg="12" md="6" class="text-right">
                <v-btn color="primary" variant="tonal"  @click="openModal" flat class="ml-auto"> 계약 생성
                </v-btn>
            </v-col>
        </v-row>
        <v-data-table :headers="headers" :items="contracts" class="elevation-0">

            <template v-slot:item.action="{ item }">
                <div class="d-flex gap-2">
                <EditIcon
                    height="20"
                    width="20"
                    class="text-primary cursor-pointer"
                    size="small"
                    @click="editContract(item)"
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

        <ContractModal
            v-model="showModal"
            :contract="editedContract"
            @save="saveContract"
            @close="closeModal"
        />
    </div>
</template>

