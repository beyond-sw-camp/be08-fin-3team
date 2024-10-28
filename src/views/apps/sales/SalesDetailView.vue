<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <div>
        <v-row>
            <v-col>
                <div>총 매출 개수: {{ totalItems }}개</div>
            </v-col>
            <v-col cols="12" class="text-right">
                <v-btn color="primary" variant="tonal"  @click="openModal" flat> 매출 추가
                </v-btn>
            </v-col>
        </v-row>

        <div class="divider"></div>

        <v-row>
            <v-col v-for="(sale, index) in paginatedSales" :key="index" cols="12" md="4">
                <v-card @click="openSalesInfo(sale)" class="sales-card">
                    <v-card-title class="sales-title">{{ sale.salesCls }}</v-card-title>
                    <v-card-subtitle class="sales-subtitle">매출 번호: {{ sale.salesNo }}</v-card-subtitle>
                    <v-card-text class="sales-text">
                        <div>수량: <span class="highlight">{{ sale.productCount }}</span></div>
                        <div>합계 금액: <span class="highlight">{{ sale.price.toLocaleString() }} 원</span></div>
                        <div>사업 유형: <span class="highlight">{{ sale.busiType }}</span></div>
                        <div>계약 번호: <span class="highlight">{{ sale.contractNo }}</span></div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col v-if="sales.length === 0" cols="12">
                <v-alert type="info">데이터가 없습니다.</v-alert>
            </v-col>
        </v-row>

        <v-row justify="center">
            <v-btn v-if="currentPage > 1" @click="changePage(currentPage - 1)">이전</v-btn>

            <!-- 페이지 번호는 최대 5개만 표시 -->
            <v-btn v-for="page in visiblePages" :key="page" @click="changePage(page)" :color="page === currentPage ? 'primary' : 'default'">
                {{ page }}
            </v-btn>

            <v-btn v-if="currentPage < totalPages" @click="changePage(currentPage + 1)">다음</v-btn>
        </v-row>

        <SalesModal
            v-model="showModal"
            :sale="editedSale"
            @save="saveSale"
            @close="closeModal"
            @deleted="fetchSales"
        />
    </div>
</template>

<script>
import SalesModal from './SalesModal.vue';
import api from '@/api/axiosinterceptor';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

export default {
    components: { SalesModal, AlertComponent },
    data() {
        return {
            sales: [], // 전체 매출 목록
            currentPage: 1, // 현재 페이지
            itemsPerPage: 12, // 페이지당 항목 수
            totalItems: 0, // 전체 항목 수
            showModal: false,
            editedSale: {
                salesNo: null,
                salesCls: '',
                salesDate: '',
                taxCls: '',
                surtaxYn: '',
                supplyPrice: 0,
                tax: 0,
                productCount: 0,
                price: 0,
                expArrivalDate: '',
                busiType: '',
                busiTypeDetail: '',
                note: '',
                contractNo: '',
            },
            search: '',
        };
    },
    setup() {
        const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();
        return { alertMessage, alertType, showAlert, triggerAlert };
    },
    mounted() {
        this.fetchSales();
    },
    computed: {
        // 현재 페이지의 데이터 계산
        paginatedSales() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.sales.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.totalItems / this.itemsPerPage);
        },
        visiblePages() {
            let startPage = Math.max(1, this.currentPage - 2);
            let endPage = Math.min(this.totalPages, this.currentPage + 2);
            if (endPage - startPage < 4) {
                if (startPage === 1) {
                    endPage = Math.min(5, this.totalPages);
                } else {
                    startPage = Math.max(1, endPage - 4);
                }
            }
            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    methods: {
    async fetchSales() {
            try {
                const res = await api.get('/sales');
                if (res && res.data && res.data.code == 200) {
                    this.sales = res.data.result;
                    this.totalItems = this.sales.length; // 전체 항목 수 업데이트
                } else {
                    console.error('올바른 응답 형식이 아닙니다:', res);
                }
            } catch (error) {
                console.error('매출 목록을 가져오는 데 실패했습니다:', error);
            }
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        openSalesInfo(sale) {
            // 매출 정보를 클릭할 때 처리하는 함수
            console.log('선택한 매출 정보:', sale);
            // 필요한 경우 추가 작업 (예: 상세 정보를 모달로 보여주는 등)
            this.editedSale = { ...sale };  // 클릭한 매출 정보를 수정할 수 있도록 할당
            this.showModal = true;  // 모달을 열기
        },
        openModal() {
            this.editedSale = {
                salesNo: null,
                salesCls: '',
                salesDate: '',
                taxCls: '',
                surtaxYn: '',
                supplyPrice: 0,
                tax: 0,
                productCount: 0,
                price: 0,
                expArrivalDate: '',
                busiType: '',
                busiTypeDetail: '',
                note: '',
                contractNo: '',
            };
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        async saveSale(sale) {
            try {
                if (sale.salesNo) {
                    await api.patch(`/sales/${sale.salesNo}`, sale);
                    this.triggerAlert('매출이 수정되었습니다.', 'success', 2000);
                } else {
                    await api.post('/sales', sale);
                    this.triggerAlert('매출이 등록되었습니다.', 'success', 2000);
                }
                this.fetchSales();
                this.closeModal();
            } catch (error) {
                console.error('매출 저장에 실패했습니다:', error);
                this.triggerAlert('매출 저장에 실패했습니다.', 'error', 2000);
            }
        },
    }

};
</script>

<style scoped>
.sales-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: #f9f9f9; 
    border: 1px solid #ddd; 
    border-radius: 8px; 
    padding: 16px; 
    max-width: 500px; 
    margin: 10px; 
}
.sales-card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
.sales-title {
    font-size: 1.5rem; 
    font-weight: bold; 
    color: #0008a3c8; 
}
.sales-subtitle {
    font-size: 1rem; 
    color: #747474; 
}
.sales-text {
    font-size: 0.9rem; 
    color: #333; 
}
.highlight {
    color: #747474; 
}

.divider {
    height: 1px;
    background-color: #aeaeae; 
    margin: 20px auto; 
    width: 100%; 
}
</style>
