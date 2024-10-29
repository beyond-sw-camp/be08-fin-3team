<template>
  <v-dialog v-model="isOpen" @close="handleClose" max-width="600px">
    <v-card>
      <v-card-title>
        <span>{{ contract.contractNo ? '계약 수정' : '계약 추가' }}</span>
      </v-card-title>
      <v-alert v-if="errorMessage" type="error" dismissible @close="errorMessage = ''">
        {{ errorMessage }}
      </v-alert>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            ref="name"
            v-model="contract.name"
            label="계약 이름"
            required
            :rules="[validateName]"
            :error-messages="nameError"
            :class="{ 'error-border': !contract.name && showErrors }"
            @input="nameError = ''" 
          />
          <v-text-field
            ref="estimateNo"
            v-model="contract.estimateNo"
            label="견적 번호"
            required
            :rules="[validateEstimate]"
            :error-messages="estimateError"
            :class="{ 'error-border': !contract.estimateNo && showErrors }"
            @input="estimateError = ''" 
          />
          <v-text-field v-model="contract.startDate" label="시작 날짜" type="date" required :height="'40px'" />
          <v-text-field v-model="contract.endDate" label="종료 날짜" type="date" required :height="'40px'" />
          <v-text-field v-model="contract.taxCls" label="세금 분류" />
          <v-text-field v-model="contract.surtaxYn" label="추가 세금 여부 (Y/N)" maxlength="1" />
          <v-text-field v-model="contract.prodCnt" label="수량" type="number" />
          <v-text-field v-model="contract.supplyPrice" label="공급 가격" type="number" />
          <v-text-field v-model="contract.tax" label="세금" type="number" />
          <v-text-field v-model="contract.price" label="총 가격" type="number" />
          <v-text-field v-model="contract.paymentTerms" label="결제 조건" />
          <v-text-field v-model="contract.warranty" label="보증 기간 (개월)" type="number" />
          <v-text-field v-model="contract.cls" label="계약 유형" />
          <v-text-field v-model="contract.expArrivalDate" label="예상 도착 날짜" type="date" />
          <v-text-field v-model="contract.arrivalNotiYn" label="도착 알림 여부 (Y/N)" maxlength="1" />
          <v-text-field v-model="contract.arrivalNotiDay" label="도착 알림 일수" type="number" />
          <v-text-field v-model="contract.renewalNotiYn" label="갱신 알림 여부 (Y/N)" maxlength="1" />
          <v-text-field v-model="contract.renewalNotiDay" label="갱신 알림 일수" type="number" />
          <v-textarea v-model="contract.note" label="비고" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn class="m-button" @click="saveContract">저장</v-btn>
        <v-btn class="m-button" @click="handleClose">취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: Boolean,
    contract: {
      type: Object,
      default: () => ({
        contractNo: null,
        name: '',
        estimateNo: '',
      }),
    },
    contracts: {  
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      valid: false,
      errorMessage: '',
      showErrors: false,
      nameError: '',
      estimateError: '',
    };
  },
  computed: {
    isOpen: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  methods: {
    scrollToField(field) {
      const fieldElement = this.$refs[field];
      if (fieldElement) {
        fieldElement.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async saveContract() {
      this.showErrors = true;
      this.errorMessage = '';
      this.nameError = '';
      this.estimateError = '';

      const formValid = await this.$refs.form.validate();

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

      if (formValid && this.contract.name && this.contract.estimateNo) {
        this.$emit('save', { ...this.contract });
        this.handleClose();
        this.errorMessage = ''; // 추가: 저장 후 에러 메시지 초기화
      }
    },

    handleClose() {
      this.$emit('close');
      this.errorMessage = ''; // 추가: 다이얼로그 닫을 때 에러 메시지 초기화
    },
  },
};
</script>

<style>
.error-border {
  border-color: red;
}
.v-text-field {
  height: 80px;
  margin-top: 10px;
}
.v-input__details {
  height: 20px;
}
.m-button {
  margin-top: 20px;
}
.v-alert {
  min-height: 50px;
}
</style>
