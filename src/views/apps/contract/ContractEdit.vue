<template>
  <v-card>
    <v-card-title>
      <span>{{ isEditMode ? '계약 수정' : '계약 생성' }}</span>
    </v-card-title>
    <v-alert v-if="errorMessage" type="error" dismissible @close="clearErrorMessage">
      {{ errorMessage }}
    </v-alert>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="contract.name"
              label="계약명"
              required
              :rules="[validateName]"
              :class="{ 'error-border': !contract.name && showErrors }"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="contract.estimateNo"
              label="견적 번호"
              required
              :rules="[validateEstimate]"
              :class="{ 'error-border': !contract.estimateNo && showErrors }"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.startDate" label="시작 날짜" type="date" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.endDate" label="종료 날짜" type="date" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="contract.taxCls"
              label="과세 구분"
              :items="['매출 과세', '매출 면세', '수출 영세']"
              @change="updateSurtaxYn"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="contract.surtaxYn"
              label="추가 세금 여부 (Y/N)"
              readonly
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.productCount" label="수량" type="number" @input="calculateTaxAndPrice" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.supplyPrice" label="공급 가격" type="number" @input="calculateTaxAndPrice" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.tax" label="세금" type="number" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.totalPrice" label="총 가격" type="number" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.paymentTerms" label="결제 조건" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.warrenty" label="보증 기간 (개월)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.contractCls" label="계약 유형" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.expectedArrivalDate" label="예상 도착 날짜" type="date" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.arrivalNotificationYn" label="도착 알림 여부 (Y/N)" maxlength="1" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.arrivalNotificationDay" label="도착 알림 일수" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.renewalNotificationYn" label="갱신 알림 여부 (Y/N)" maxlength="1" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.renewalNotificationDay" label="갱신 알림 일수" type="number" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="contract.note" label="비고" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn class="m-button" color="primary" variant="outlined" @click="saveContract" flat style="font-size: 15px; font-weight: 600;">저장</v-btn>
      <v-btn class="m-button" color="error" variant="outlined" @click="deleteContract(contract.contractNo)" style="font-size: 15px; font-weight: 600;" v-if="isEditMode">삭제</v-btn>
      <v-btn class="m-button" color="close" variant="outlined" @click="handleClose" style="font-size: 15px; font-weight: 600;">닫기</v-btn>
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
      nameError: '',
      estimateError: '',
      isEditMode: false, 
      contract: {
        contractNo: null,
        name: '',
        estimateNo: '',
        startDate: '',
        endDate: '',
        taxCls: '',
        surtaxYn: '',
        productCount: 0,
        supplyPrice: 0,
        tax: 0,
        totalPrice: 0,
        paymentTerms: '',
        warrenty: 0,
        contractCls: '',
        expectedArrivalDate: '',
        arrivalNotificationYn: '',
        arrivalNotificationDay: 0,
        renewalNotificationYn: '',
        renewalNotificationDay: 0,
        note: '',
      },
    };
  },
  mounted() {
    const contractNo = this.$route.params.contractNo; 
    if (contractNo) {
      this.isEditMode = true; // 수정 모드 활성화
      this.loadContractData(contractNo); 
    } else {
      this.isEditMode = false; // 생성 모드
    }
    this.updateSurtaxYn();
  },
  watch: {
    'contract.taxCls': 'updateSurtaxYn',
  },
  methods: {
    updateSurtaxYn() {
      if (this.contract.taxCls === '매출 과세') {
        this.contract.surtaxYn = 'Y';
      } else {
        this.contract.surtaxYn = 'N';
      }
      this.calculateTaxAndPrice();
    },
    calculateTaxAndPrice() {
      const supplyPrice = parseFloat(this.contract.supplyPrice) || 0;
      const productCount = parseInt(this.contract.productCount) || 0;
      const surtaxYn = this.contract.surtaxYn.toUpperCase();

      this.contract.tax = surtaxYn === 'Y' ? supplyPrice * 0.1 : 0;
      this.contract.totalPrice = surtaxYn === 'Y' 
        ? (supplyPrice + this.contract.tax) * productCount 
        : supplyPrice * productCount;
    },
    async loadContractData(contractNo) {
      try {
        const response = await api.get(`/contract/${contractNo}`); 
        if (response.data) {
          this.contract = response.data.result; 
        } else {
          this.errorMessage = '계약 정보를 가져오는 데 실패했습니다.';
        }
      } catch (error) {
        console.error('계약 정보를 불러오는 중 오류 발생:', error);
        this.errorMessage = '계약 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.';
      }
    },
    async saveContract() {
      this.showErrors = true;
      this.errorMessage = '';

      if (!this.contract.name) {
        this.nameError = '계약명을 입력해 주세요.';
        this.errorMessage = '필수값이 입력되지 않았습니다.';
        this.scrollToField('name');
      }

      if (!this.contract.estimateNo) {
        this.estimateError = '견적 번호를 입력해 주세요.';
        this.errorMessage = '필수값이 입력되지 않았습니다.';
        this.scrollToField('estimateNo');
      }
      
      const formValid = await this.$refs.form.validate();
      if (!formValid) {
        this.scrollToTop();
        await this.triggerAlert('필수 입력값을 확인해주세요.', 'error');
        return;
      }

      try {
        let response;
        if (this.isEditMode) {
          // 수정 모드일 경우 PATCH 요청
          response = await api.patch(`/contract/${this.contract.contractNo}`, this.contract);
        } else {
          // 생성 모드일 경우 POST 요청
          response = await api.post('/contract', this.contract);
        }

        if (response.data?.result?.contractNo) {
          await this.triggerAlert('계약이 성공적으로 저장되었습니다.', 'success');
          this.$router.push('/apps/contract');
        } else {
          await this.triggerAlert('계약 번호가 확인되지 않습니다.', 'info');
        }
      } catch (error) {
        console.error('계약 저장 중 오류 발생:', error.response || error.message);
        this.scrollToTop();
        await this.triggerAlert('계약 저장에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    },
    scrollToTop() {
      document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    scrollToField(field) {
      const fieldElement = this.$refs[field];
      if (fieldElement) {
        fieldElement.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    validateName(value) {
      return !!value || '계약명은 필수입니다.';
    },
    validateEstimate(value) {
      return !!value || '견적 번호는 필수입니다.';
    },
    handleClose() {
      this.$router.push('/apps/contract');
    },
    clearErrorMessage() {
      this.errorMessage = '';
    },
    triggerAlert(message, type) {
      this.$emit('trigger-alert', { message, type });
    },
    async deleteContract(contractNo) {
      try {
        const response = await api.delete(`/contract/${contractNo}`);
        if (response.status === 200) {  
          await this.triggerAlert('삭제가 완료되었습니다.', 'success');
          this.$router.push('/apps/contract');  
        } else {
          await this.triggerAlert('삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        }
      } catch (error) {
        console.error('계약 삭제 중 오류 발생:', error.response || error.message);
        this.scrollToTop();
        await this.triggerAlert('계약 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      }
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
