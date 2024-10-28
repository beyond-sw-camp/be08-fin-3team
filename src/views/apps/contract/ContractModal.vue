<template>
  <v-dialog v-model="isOpen" @close="handleClose" max-width="600px">
    <v-card>
      <v-card-title>
        <span>{{ contract.contractNo ? '계약 수정' : '계약 추가' }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="contract.name" label="계약 이름" required />
          <v-text-field v-model="contract.startDate" label="시작 날짜" type="date" required />
          <v-text-field v-model="contract.endDate" label="종료 날짜" type="date" required />
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
          <v-text-field v-model="contract.estimateNo" label="견적 번호" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="outlined" @click="saveContract" flat style="font-size: 15px; font-weight: 600;">저장</v-btn>
        <v-btn color="close" @click="handleClose" style="font-size: 15px; font-weight: 600;">닫기</v-btn>
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
      }),
    },
  },
  data() {
    return {
      valid: false,
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
    saveContract() {
      if (this.$refs.form.validate()) {
        console.log('폼이 유효합니다. 저장을 시작합니다.');
        this.$emit('save', this.contract);  // 부모 컴포넌트로 이벤트 전달
        this.handleClose();  // 모달 닫기
      } else {
        console.log('폼이 유효하지 않습니다.');  // 폼 유효성 문제 시
      }
    },
    handleClose() {
      this.isOpen = false;
      this.$emit('close');
    },
  },
};
</script>
