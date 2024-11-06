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
              ref="salesName"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.contractName"
              label="계약명 *"
              :rules="[validateContractName]"
              append-inner-icon="mdi-magnify"
              @click:append-inner="openContractDialog"
              class="clickable-field"
              readonly
            ></v-text-field>
          </v-col>

          <v-dialog v-model="contractDialog" max-width="800">
            <v-card>
              <v-card-title class="headline">계약 조회</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="contracts"
                  item-value="contractNo"
                  class="border rounded-md"
                  items-per-page="5"
                  @click:row="handleRowClick"
                >
                  <template v-slot:item="{ item }">
                    <tr
                      :class="{
                        'highlighted-row': selectedContract && selectedContract.contractNo === item.contractNo
                      }"
                      @click="selectContract(item)"
                      @dblclick="confirmContractSelection(item)"
                    >
                      <td>{{ item.name }}</td>
                      <td>{{ item.contractDate }}</td>
                    </tr>
                  </template>
                </v-data-table>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="confirmContractSelection">선택</v-btn>
                <v-btn color="error" @click="closeContractDialog">닫기</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

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
            <v-select
              v-model="sales.taxCls"
              label="과세 구분"
              :items="['매출 과세', '매출 면세', '수출 영세']"
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
              type="text"
              @input="calculateTaxAndPrice"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="sales.supplyPrice"
              label="공급 가격"
              type="text"
              @input="calculateTaxAndPrice"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.tax" label="세금" type="text" readonly />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="sales.price" label="총 가격" type="text" readonly />
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
      contractDialog: false,
      loadingContracts: false,
      selectedContract: false,
      sales: {
        salesNo: null,
        salesName: '',
        salesDate: '',
        taxCls: '',
        surtaxYn: '',
        productCount: '',
        supplyPrice: '',
        tax: '',
        price: '',
        expArrivalDate: '',
        busiType: '',
        busiTypeDetail: '',
        note: '',
        contractNo: null,
        contractName: '',
      },
      contracts:[],
      headers:[
        {title: '계약명', key: 'name' },
        {title: '계약일', key: 'contractDate' },
      ]
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
    this.loadContracts();
  },

  methods: {
    selectContract(contract) {
      this.selectedContract = contract;
    },
    handleContractSelected(selectedContract) {
      this.sales.contractNo = selectedContract.contractNo;
      this.sales.contractName = selectedContract.name;
      console.log('name:',this.sales.contractName)
    },
    openContractDialog() {
      this.contractDialog = true
    },
    closeContractDialog(){
      this.contractDialog = false
    },
    async loadContracts() {
      this.loadingContracts = true;
      try {
        // const response = await api.get('/contract/without-sales');
        const response = await api.get('/contract');
        console.log('데이터 확인 !! : ',response.data); // 응답 데이터 확인
        if (response.data) {
          this.contracts = response.data.result;
        }
      } catch (error) {
        console.error('견적 리스트를 불러오는 중 오류 발생:', error);
      } finally {
        this.loadingContracts = false;
      }
    },
    handleClose() {
      this.$router.push('/apps/sales');
    },
    handleRowClick(item) {
      this.selectedContract = item;
    },
    confirmContractSelection() {
    console.log('Selected Contract:', this.selectedContract);
    
      if (this.selectedContract) {
        this.handleContractSelected(this.selectedContract); // 선택한 견적 정보를 업데이트
      } else {
        console.warn("No Contract selected.");
      }
      this.closeContractDialog();
    },
    async loadSalesData(salesNo) {
      try {
        const response = await api.get(`/sales/${salesNo}`);
        if (response.data) {
          this.sales = response.data.result;
          this.sales.contractName = response.data.result.contractName;
        } else {
          this.errorMessage = '계약 정보를 가져오는 데 실패했습니다.';
        }
      } catch (error) {
        console.error('계약 정보를 불러오는 중 오류 발생:', error);
        this.errorMessage = '계약 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.';
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
    calculateTaxAndPrice() {
      const supplyPrice = parseInt(this.sales.supplyPrice.replace(/,/g, '')) || 0;
      const productCount = parseInt(this.sales.productCount.replace(/,/g, '')) || 0;
      const surtaxYn = this.sales.surtaxYn ? this.sales.surtaxYn.toUpperCase() : 'N';

      this.sales.tax = surtaxYn === 'Y' ? Math.floor(supplyPrice * 0.1) : 0;
      this.sales.price = surtaxYn === 'Y'
        ? Math.floor((supplyPrice + this.sales.tax) * productCount)
        : Math.floor(supplyPrice * productCount);

      // 세자리마다 쉼표가 포함된 값으로 포맷
      this.sales.productCount = this.formatNumber(productCount);
      this.sales.tax = this.formatNumber(this.sales.tax);
      this.sales.supplyPrice = this.formatNumber(supplyPrice);
      this.sales.price = this.formatNumber(this.sales.price);
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
      const salesData = {
          ...this.sales,
          productCount: parseInt(this.sales.productCount.replace(/,/g, ''), 10) || 0,
          supplyPrice: parseInt(this.sales.supplyPrice.replace(/,/g, ''), 10) || 0,
          tax: parseInt(this.sales.tax.replace(/,/g, ''), 10) || 0,
          price: parseInt(this.sales.price.replace(/,/g, ''), 10) || 0,
        };

      try {
          if (this.isEditMode) {
              await api.patch(`/sales/${this.sales.salesNo}`, salesData);
          } else {
              await api.post('/sales', salesData);
          }
          
      } catch (error) {
          console.error('매출 저장 중 오류 발생:', error);
          await this.triggerAlert('매출 저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
      this.$router.push({ 
        name: 'Sales',
        query: { 
            contractNo: this.sales.contractNo,
            contractName: this.sales.contractName,
        }
      });
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

    validateName: (v) => !!v || '매출명은 필수입니다.',
    validateContractName: (v) => !!v || '계약명은 필수입니다.',
  },
};
</script>

<style scoped>
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
