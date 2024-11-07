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
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="contract.estimateName"
              label="견적명"
              append-inner-icon="mdi-magnify"
              @click:append-inner="openEstimateDialog"
              class="clickable-field"
              required
              :rules="[validateEstName]"
              readonly
            ></v-text-field>
          </v-col>
          <v-dialog v-model="estimateDialog" max-width="800">
            <v-card>
              <v-card-title class="headline">견적 조회</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="estimates"
                  item-value="estNo"
                  class="border rounded-md"
                  items-per-page="5"
                  @click:row="handleRowClick"
                >
                  <template v-slot:item="{ item }">
                    <tr
                      :class="{
                        'highlighted-row': selectedEstimate && selectedEstimate.estNo === item.estNo
                      }"
                      @click="selectEstimate(item)"
                      @dblclick="confirmEstimateSelection(item)"
                    >
                      <td>{{ item.name }}</td>
                      <td>{{ item.estDate }}</td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="confirmEstimateSelection">선택</v-btn>
                <v-btn color="error" @click="closeEstimateDialog">닫기</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.contractDate" label="시작 날짜" type="date" required />
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
            <v-text-field v-model="contract.productCount" label="수량" type="text" @input="calculateTaxAndPrice" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.supplyPrice" label="공급 가격" type="text" @input="calculateTaxAndPrice" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.tax" label="세금" type="text" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="contract.totalPrice" label="총 가격" type="text" readonly />
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
      <v-btn class="m-button" color="close" variant="outlined" @click="handleClose" style="font-size: 15px; font-weight: 600;">목록으로 이동</v-btn>
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
      estimateDialog: false,
      selectedEstimate: null,
      loadingEstimates: false,
      contract: {
        contractNo: null,
        name: '',
        estimateNo: null,
        estimateName: '',
        contractDate: '',
        taxCls: '',
        surtaxYn: '',
        productCount: '',
        supplyPrice: '',
        tax: '',
        totalPrice: '',
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
      estimates: [], 
      headers: [
        { title: '견적명', key: 'name' },
        { title: '제출일자', key: 'estDate' },
      ],
    };
  },
  mounted() {
    const contractNo = this.$route.params.contractNo;
    if (contractNo) {
      this.isEditMode = true;
      this.loadContractData(contractNo);
    } else {
      this.isEditMode = false;
    }
    this.updateSurtaxYn();
    this.loadEstimates(); 
  },
  watch: {
    'contract.taxCls': 'updateSurtaxYn',
  },
  methods: {
    selectEstimate(estimate) {
      this.selectedEstimate = estimate;
    },
    handleEstimateSelected(selectedEstimate) {
      this.contract.estimateNo = selectedEstimate.estNo;
      this.contract.estimateName = selectedEstimate.name;
      console.log('name:',this.contract.estimateName)
    },
    openEstimateDialog() {
      this.estimateDialog = true;
    },
    closeEstimateDialog() {
      this.estimateDialog = false;
    },
    async loadEstimates() {
      this.loadingEstimates = true;
      try {
        const response = await api.get('/estimates/without-contract');
        console.log('데이터 확인 !! : ',response.data); // 응답 데이터 확인
        if (response.data) {
          this.estimates = response.data.result;
        }
      } catch (error) {
        console.error('견적 리스트를 불러오는 중 오류 발생:', error);
      } finally {
        this.loadingEstimates = false;
      }
    },
    handleRowClick(item) {
      this.selectedEstimate = item;
    },
    confirmEstimateSelection() {
    console.log('Selected Estimate:', this.selectedEstimate);
    
      if (this.selectedEstimate) {
        this.handleEstimateSelected(this.selectedEstimate); // 선택한 견적 정보를 업데이트
      } else {
        console.warn("No estimate selected.");
      }
      this.closeEstimateDialog();
    },


    async loadContractData(contractNo) {
      try {
        const response = await api.get(`/contract/${contractNo}`);
        if (response.data) {
          this.contract = response.data.result;
          this.contract.estimateName = response.data.result.estimateName;
        } else {
          this.errorMessage = '계약 정보를 가져오는 데 실패했습니다.';
        }
      } catch (error) {
        console.error('계약 정보를 불러오는 중 오류 발생:', error);
        this.errorMessage = '계약 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.';
      }
    },
    updateSurtaxYn() {
      if (this.contract.taxCls === '매출 과세') {
        this.contract.surtaxYn = 'Y';
      } else {
        this.contract.surtaxYn = 'N';
      }
      this.calculateTaxAndPrice();
    },
    calculateTaxAndPrice() {
      const supplyPrice = parseInt(this.contract.supplyPrice.replace(/,/g, '')) || 0; // 쉼표 제거
      const productCount = parseInt(this.contract.productCount.replace(/,/g, '')) || 0; // 쉼표 제거
      const surtaxYn = this.contract.surtaxYn.toUpperCase();

      // 세금과 총 가격 계산, 소수점 이하 버림
      this.contract.tax = surtaxYn === 'Y' ? Math.floor(supplyPrice * 0.1) : 0;
      this.contract.totalPrice = surtaxYn === 'Y'
        ? Math.floor((supplyPrice + this.contract.tax) * productCount)
        : Math.floor(supplyPrice * productCount);

      // 세자리마다 쉼표가 포함된 값으로 포맷
      this.contract.productCount = this.formatNumber(productCount);
      this.contract.tax = this.formatNumber(this.contract.tax);
      this.contract.supplyPrice = this.formatNumber(supplyPrice);
      this.contract.totalPrice = this.formatNumber(this.contract.totalPrice);
    },

    formatNumber(value) {
      // 숫자를 3자리마다 쉼표로 포맷하고, 맨 앞의 3자리는 쉼표 없이 처리
      if (value === null || value === undefined || isNaN(value)) {
        return value; // 유효하지 않은 경우 그대로 반환
      }

      // 숫자를 문자열로 변환하고, 정수 부분과 소수 부분 분리
      const parts = value.toString().split('.');
      const integerPart = parts[0];
      const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

      // 정수 부분을 3자리마다 쉼표로 포맷
      const formattedInteger = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      
      // 결과 조합
      return formattedInteger + decimalPart;
    },

    async saveContract() {
      this.showErrors = true;
      this.errorMessage = '';

      if (!this.contract.name || this.contract.name.trim() === '') {
        this.nameError = '계약명을 입력해 주세요.';
        this.errorMessage = '필수값이 입력되지 않았습니다.';
        this.scrollToField('name');
      }

      if (!this.contract.estimateName || this.contract.estimateName.trim() === '') {
        this.estimateError = '견적명을 입력해 주세요.';
        this.errorMessage = '필수값이 입력되지 않았습니다.';
        this.scrollToField('estimateName');
      }
      
      const formValid = await this.$refs.form.validate();
      if (!formValid) {
        this.scrollToTop();
        await this.triggerAlert('필수 입력값을 확인해주세요.', 'error');
        return;
      }
      try {
        // 저장 시 문자열로 된 수량과 공급 가격을 정수로 변환하여 저장
        const contractData = {
          ...this.contract,
          productCount: parseInt(this.contract.productCount.replace(/,/g, ''), 10) || 0,
          supplyPrice: parseInt(this.contract.supplyPrice.replace(/,/g, ''), 10) || 0,
          tax: parseInt(this.contract.tax.replace(/,/g, ''), 10) || 0,
          totalPrice: parseInt(this.contract.totalPrice.replace(/,/g, ''), 10) || 0,
        };

        let response;
        if (this.isEditMode) {
          response = await api.patch(`/contract/${this.contract.contractNo}`, contractData);
        } else {
          response = await api.post('/contract', contractData);
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
      this.$router.push({ 
        name: 'Contract',
        query: { 
            estimateNo: this.contract.estimateNo,
            estimateName: this.contract.estimateName 
        }
      });
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
    validateEstName(value) {
      return !!value || '견적명은 필수입니다.';
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
.selected-row {
  border: 2px solid blue;
}
.highlighted-row {
  background-color: #E3F2FD;
}
.clickable-field {
  cursor: pointer;
}
</style>
