<template>
    <div>
        <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
        <v-row>
            <v-col>
                <div>총 매출 개수: {{ filteredSales.length }}개</div>
            </v-col>
            <v-col cols="12" class="text-right">
                <v-btn color="primary" variant="tonal" @click="openCreateSalesPage" flat>
                    매출 추가
                </v-btn>
            </v-col>
        </v-row>

        <div class="divider"></div>
        <v-row>
            <v-col v-for="(sale, index) in paginatedSales" :key="index" cols="12" md="4">
                <v-card @click="openEditSalesPage(sale.salesNo)" class="sales-card">
                    <v-card-title class="sales-title">{{ sale.salesName }}</v-card-title>
                    <!-- <v-card-subtitle class="sales-subtitle">매출 번호: {{ sale.salesNo }}</v-card-subtitle> -->
                    <v-card-text class="sales-text">
                        <div>수량: <span class="highlight">{{ sale.productCount }}</span></div>
                        <div>합계 금액: <span class="highlight">{{ sale.price.toLocaleString() }} 원</span></div>
                        <div>사업 유형: <span class="highlight">{{ sale.busiType }}</span></div>
                        <div>계약명: <span class="highlight">{{ sale.contractName }}</span></div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col v-if="filteredSales.length === 0" cols="12">
                <v-alert type="info">데이터가 없습니다.</v-alert>
            </v-col>
        </v-row>

        <v-row justify="center">
            <v-btn v-if="currentPage > 1" @click="changePage(currentPage - 1)">이전</v-btn>
            <v-btn v-for="page in visiblePages" :key="page" @click="changePage(page)" :color="page === currentPage ? 'primary' : 'default'">
                {{ page }}
            </v-btn>
            <v-btn v-if="currentPage < totalPages" @click="changePage(currentPage + 1)">다음</v-btn>
        </v-row>
    </div>
</template>

<script>
import api from '@/api/axiosinterceptor';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import { useAlert } from '@/utils/useAlert';

export default {
    components: { AlertComponent },
    props: {
        filter: {
            type: Object,
            default: () => ({
                salesName: '',
                businessType: '',
                taxClassification: '',
                salesDate: ''
            }),
        },
    },
    data() {
        return {
            sales: [],
            filteredSales: [], // 필터링된 데이터 저장
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            search: '',
        };
    },
    setup() {
        const { alertMessage, alertType, showAlert } = useAlert();
        return { alertMessage, alertType, showAlert };
    },
    mounted() {
        this.fetchSales();
    },
    computed: {
        paginatedSales() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredSales.slice(start, end); // 필터링된 결과로 페이지네이션 적용
        },
        totalPages() {
            return Math.ceil(this.filteredSales.length / this.itemsPerPage); // 필터링된 결과를 기준으로 총 페이지 계산
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
        },
    },
    methods: {
        async fetchSales() {
            try {
                const res = await api.get('/sales', {
                    params: this.filter // 필터 조건을 params로 전달
                });
                if (res && res.data && res.data.code === 200) {
                    this.sales = res.data.result;
                    this.totalItems = this.sales.length;
                    this.applyFilter(); // 필터 적용
                } else {
                    console.error('올바른 응답 형식이 아닙니다:', res);
                }
            } catch (error) {
                console.error('매출 목록을 가져오는 데 실패했습니다:', error);
            }
        },
        applyFilter() {
            this.filteredSales = this.sales.filter(sale => {
                return (
                    // 매출명 필터링 (부분 일치 검색)
                    (this.filter.salesName ? sale.salesName.includes(this.filter.salesName) : true) &&

                    // 사업 유형 필터링 (부분 일치 검색)
                    (this.filter.businessType ? sale.busiType.includes(this.filter.businessType) : true) &&

                    // 과세 구분 필터링
                    (this.filter.taxClassification ? sale.taxCls === this.filter.taxClassification : true) &&

                    // 시작 날짜 필터링 (검색하는 날짜 이후의 데이터만 포함)
                    (this.filter.startDate ? new Date(sale.salesDate) >= new Date(this.filter.startDate) : true) &&

                    // 종료 날짜 필터링 (검색하는 날짜 이전의 데이터만 포함)
                    (this.filter.endDate ? new Date(sale.salesDate) <= new Date(this.filter.endDate) : true)
                );
            });
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        openEditSalesPage(salesNo) {
            window.location.href = `/apps/sales/editer/${salesNo}`; 
        },
        openCreateSalesPage() {
            window.location.href = `/apps/sales/editer`;
        },
    },
    watch: {
        filter: {
            handler() {
                this.applyFilter(); 
            },
            deep: true, 
        },
    },
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
