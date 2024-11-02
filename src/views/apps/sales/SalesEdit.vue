<template>
  <v-card>
    <v-card-title>
      <span>{{ isEditMode ? '매출 수정' : '매출 생성' }}</span>
    </v-card-title>
    <v-alert v-if="errorMessage" type="error" dismissible @close="clearErrorMessage">
      {{ errorMessage }}
    </v-alert>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.salesName"
              label="매출명 *"
              :rules="[validateName]"
              required
              :class="{ 'error-border': !sales.salesName && showErrors }"
              ref="salesName"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.contractNo"
              label="계약 번호 *"
              :rules="[validateContractNo]"
              required
              :class="{ 'error-border': !sales.contractNo && showErrors }"
              ref="contractNo"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.salesDate"
              label="매출 날짜 *"
              type="date"
              :rules="[salesDate]"
              required
              ref="salesDate"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="sales.taxCls"
              label="과세 구분"
              :items="['매출 과세', '매출 면세', '수출 영세']"
              :rules="[validateTaxCls]"
              @change="updateSurtaxYn"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.surtaxYn"
              label="추가 세금 여부 (Y/N)"
              readonly
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.productCount"
              label="수량"
              type="number"
              @input="calculateTaxAndPrice"
              :rules="[validateProductCount]"
              ref="productCount"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.supplyPrice"
              label="공급 가격"
              type="number"
              @input="calculateTaxAndPrice"
              :rules="[validateSupplyPrice]"
              ref="supplyPrice"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.tax" label="세금" type="number" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.price" label="총 가격" type="number" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.expArrivalDate" label="예상 도착 날짜" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.busiType" label="사업 유형" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.busiTypeDetail" label="사업 유형 상세" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="sales.note" label="비고" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn class="m-button" color="primary" variant="outlined" @click="saveSales" flat style="font-size: 15px; font-weight: 600;">
        저장
      </v-btn>
      <v-btn
        v-if="isEditMode"
        class="m-button"
        color="error"
        variant="outlined"
        @click="deleteSales(sales.salesNo)"
        style="font-size: 15px; font-weight: 600;"
      >
        삭제
      </v-btn>
      <v-btn class="m-button" color="close" variant="outlined" @click="handleClose" style="font-size: 15px; font-weight: 600;">
        목록으로 이동
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import api from '@/api/axiosinterceptor';

export default {
  data() {
    return {
      valid: false,
      errorMessage: '',
      showErrors: false,
      isEditMode: false,
      sales: {
        salesNo: null,
        salesName: '',
        salesDate: '',
        taxCls: '',
        surtaxYn: '',
        productCount: 0,
        supplyPrice: 0,
        tax: 0,
        price: 0,
        expArrivalDate: '',
        busiType: '',
        busiTypeDetail: '',
        note: '',
        contractNo: null,  // contractNo 추가
      },
    };
  },
  watch: {
    'sales.taxCls': 'updateSurtaxYn',
  },
  mounted() {
    const salesNo = this.$route.params.salesNo;
    if (salesNo) {
      this.isEditMode = true; // 수정 모드 활성화
      this.loadSalesData(salesNo);
    } else {
      this.isEditMode = false; // 생성 모드
    }
    this.updateSurtaxYn();
  },

  methods: {
    handleClose() {
      this.$router.push('/apps/sales');
    },
    async loadSalesData(salesNo) {
      try {
        const response = await api.get(`/sales/${salesNo}`);
        if (response.data) {
          this.sales = response.data.result;
          this.calculateTaxAndPrice(); 
        } else {
          this.errorMessage = '매출 정보를 가져오는 데 실패했습니다.';
        }
      } catch (error) {
        console.error('매출 정보를 불러오는 중 오류 발생:', error);
        this.errorMessage = '매출 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.';
      }
    },

    calculateTaxAndPrice() {
      const supplyPrice = parseFloat(this.sales.supplyPrice) || 0;
      const productCount = parseInt(this.sales.productCount) || 0;
      const surtaxYn = this.sales.surtaxYn ? this.sales.surtaxYn.toUpperCase() : 'N';

      this.sales.tax = 0;
      this.sales.price = 0;

      if (surtaxYn === 'Y') {
        this.sales.tax = supplyPrice * 0.1;
        this.sales.price = (supplyPrice + this.sales.tax) * productCount;
      } else {
        this.sales.price = supplyPrice * productCount;
      }
    },

    updateSurtaxYn() {
      const taxCls = this.sales.taxCls;

      // 과세 구분에 따라 추가 세금 자동
      if (taxCls === '매출 과세') {
        this.sales.surtaxYn = 'Y'; 
      } else {
        this.sales.surtaxYn = 'N'; 
      }

      this.calculateTaxAndPrice(); 
    },

    async saveSales() {
      console.log("Sending sales data:", this.sales);
      this.showErrors = true;
      this.errorMessage = '';

      // 필수값 체크 및 에러 처리
      if (!this.sales.salesName) {
          this.errorMessage = '매출명을 입력해 주세요.';
          this.scrollToField('salesName');
          return;
      }

      if (!this.sales.salesDate) {
          this.errorMessage = '매출 날짜를 입력해 주세요.';
          this.scrollToField('salesDate');
          return;
      }

      // 필요 필드 체크
      if (!this.sales.taxCls) {
          this.errorMessage = '과세 구분을 입력해 주세요.';
          this.scrollToField('taxCls');
          return;
      }

      if (!this.sales.productCount) {
          this.errorMessage = '수량을 입력해 주세요.';
          this.scrollToField('productCount');
          return;
      }

      if (!this.sales.supplyPrice) {
          this.errorMessage = '단가를 입력해 주세요.';
          this.scrollToField('supplyPrice');
          return;
      }

      // 계약 번호 체크
      if (!this.sales.contractNo) {
          this.errorMessage = '계약 번호를 입력해 주세요.';
          this.scrollToField('contractNo');
          return;
      }

      const formValid = await this.$refs.form.validate();
      if (!formValid) {
          await this.triggerAlert('필수 입력값을 확인해주세요.', 'error');
          this.scrollToTop();
          return;
      }

      // 수정 모드에서만 salesNo 체크
      if (this.isEditMode && !this.sales.salesNo) {
          this.errorMessage = '매출 번호가 누락되었습니다.';
          await this.triggerAlert(this.errorMessage, 'error');
          return;
      }

      try {
          if (this.isEditMode) {
              await api.patch(`/sales/${this.sales.salesNo}`, this.sales);
          } else {
              await api.post('/sales', this.sales);
          }
          this.handleClose(); // 완료 후 페이지 닫기
      } catch (error) {
          console.error('매출 저장 중 오류 발생:', error);
          await this.triggerAlert('매출 저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
    },

    async deleteSales(salesNo) {
      const confirmDelete = confirm('정말로 삭제하시겠습니까?');
      if (confirmDelete) {
          try {
              await api.delete(`/sales/${salesNo}`);
              await this.triggerAlert('매출 삭제 완료.', 'success');
              this.handleClose(); // 삭제 후 페이지 닫기
          } catch (error) {
              console.error('매출 삭제 중 오류 발생:', error);
              await this.triggerAlert('매출 삭제 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
          }
      }
    },

    scrollToField(ref) {
      this.$nextTick(() => {
        const field = this.$refs[ref][0]?.$el;
        if (field) {
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    clearErrorMessage() {
      this.errorMessage = '';
    },

    async triggerAlert(message, type) {
      this.errorMessage = message;
      setTimeout(() => {
        this.clearErrorMessage();
      }, 3000);
    },

    validateName: (v) => !!v || '이름은 필수입니다.',
    validateContractNo: (v) => !!v || '계약 번호는 필수입니다.',
    validateProductCount: (v) => (v >= 0) || '수량은 0 이상이어야 합니다.',
    validateSupplyPrice: (v) => (v >= 0) || '공급 가격은 0 이상이어야 합니다.',
    validateTaxCls: (v) => !!v || '과세 구분은 필수입니다.',
  },
};
</script>

<style scoped>
.error-border {
  border: 1px solid red !important;
}
</style>
