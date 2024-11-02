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
              required
              :rules="[validateName]"
              :class="{ 'error-border': !sales.salesName && showErrors }"
              ref="salesName"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.salesDate"
              label="매출 날짜 *"
              type="date"
              required
              ref="salesDate"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.taxCls" label="세금 분류" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.surtaxYn" label="추가 세금 여부 (Y/N)" maxlength="1" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="sales.productCount" 
              label="수량" 
              type="number" 
              @input="calculateTaxAndPrice" 
              ref="productCount"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="sales.supplyPrice" 
              label="공급 가격" 
              type="number" 
              @input="calculateTaxAndPrice" 
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
        닫기
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
        contractNo: null,
      },
    };
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.salesNo;
    },
  },
  mounted() {
    const salesNo = this.$route.params.salesNo;
    if (salesNo) {
      this.loadSalesData(salesNo);
    }
  },
  methods: {
    async loadSalesData(salesNo) {
      if (!salesNo) {
        this.errorMessage = '유효한 매출 번호가 필요합니다.';
        return;
      }
      try {
        const response = await api.get(`/sales/${salesNo}`);
        if (response.data && response.data.result) {
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
    async saveSales() {
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

  const formValid = await this.$refs.form.validate();
  if (!formValid) {
    await this.triggerAlert('필수 입력값을 확인해주세요.', 'error');
    this.scrollToTop();
    return;
  }

  try {
    const method = this.isEditMode ? 'patch' : 'post';
    const endpoint = this.isEditMode ? `/sales/${this.sales.salesNo}` : '/sales';
    
    // 수정 모드일 때 salesNo가 유효한지 체크
    if (this.isEditMode && !this.sales.salesNo) {
      this.errorMessage = '수정할 매출 번호가 필요합니다.';
      return;
    }

    const response = await api[method](endpoint, this.sales);
    if (response.data?.result?.salesNo) {
      await this.triggerAlert('매출이 성공적으로 저장되었습니다.', 'success');
      this.$router.push('/apps/sales');
    } else {
      await this.triggerAlert('매출 번호가 확인되지 않습니다.', 'info');
    }
  } catch (error) {
    console.error('매출 저장 중 오류 발생:', error);
    await this.triggerAlert('매출 저장에 실패했습니다. 다시 시도해주세요.', 'error');
  }
},
    async deleteSales(salesNo) {
      try {
        const response = await api.delete(`/sales/${salesNo}`);
        if (response.status === 200) {
          await this.triggerAlert('삭제가 완료되었습니다.', 'success');
          this.$router.push('/apps/sales');
        } else {
          await this.triggerAlert('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        }
      } catch (error) {
        console.error('매출 삭제 중 오류 발생:', error);
        await this.triggerAlert('매출 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    },
    handleClose() {
      this.$router.push('/apps/sales');
    },
    clearErrorMessage() {
      this.errorMessage = '';
    },
    triggerAlert(message, type) {
      this.$emit('trigger-alert', { message, type });
    },
    validateName(value) {
      return !!value || '매출명은 필수입니다.';
    },
    scrollToField(field) {
      const fieldElement = this.$refs[field];
      if (fieldElement) {
        fieldElement.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 필드의 스타일 변경 (예: 탭 색상 변경)
        fieldElement.$el.classList.add('error-border');
      }
    },
    scrollToTop() {
      document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  },
};
</script>

<style>
.error-border {
  border-color: red;
}
.m-button {
  margin-top: 20px;
}
</style>
