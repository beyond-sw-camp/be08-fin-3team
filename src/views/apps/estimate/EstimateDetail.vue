<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axiosinterceptor';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const route = useRoute();
const router = useRouter();

const isMounted = ref(false);

const pageTitle = computed(() => (route.params.estNo ? '견적 상세' : '견적 등록'));
const pagePath = computed(() => (route.params.estNo ? `/sales/estimates/${route.params.estNo}` : '/sales/estimates/new'));
const saveBtn = computed(() => (route.params.estNo ? '수정' : '저장'));

const page = ref({ title: pageTitle });
const breadcrumbs = ref([
    { text: '영업관리', disabled: false, href: '#' },
    { text: '견적', disabled: false, href: '#' },
    { text: '견적 목록', disabled: false, href: '/sales/estimates' },
    { text: pageTitle, disabled: true, href: pagePath }
]);

const showConfirmDialogs = ref(false);
const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const userRole = ref(localStorage.getItem('loginUserRole') !== 'ADMIN');

const formatNumber = (value) => new Intl.NumberFormat().format(value);

const searchCond = reactive({
    propName: '',
    deptNo: userRole.value ? localStorage.getItem('loginDeptNo') : 0,
    userNo: userRole.value ? localStorage.getItem('loginUserNo') : 0
});

const taxClasses = ref([
    { text: '매출과세', value: '매출과세' },
    { text: '매출면세', value: '매출면세' },
    { text: '수출영세', value: '수출영세' }
]);

const surtaxOptions = ref([
    { text: 'N ', value: 'N' },
    { text: 'Y', value: 'Y' }
]);

const estimateData = reactive({
    estNo: null,
    name: '',
    company: '',
    customerName: '',
    propNo: null,
    propName: '',
    estDate: new Date().toISOString().substring(0, 10),
    taxCls: '',
    surtaxYn: '',
    prodCnt: 0,
    supplyPrice: 0,
    tax: 0,
    totalPrice: 0,
    userName: '',
    note: '',
    products: []
});

const fetchData = async (estNo) => {
    try {
        const { data } = await api.get(`/estimates/${estNo}`);

        if (data.isSuccess) {
            Object.assign(estimateData, data.result, { products: data.result.products.map((p) => ({ ...p })) });
        } else {
            triggerAlert(response.data.message, 'error');
        }
    } catch (error) {
        console.error('견적 정보 조회 중 오류가 발생했습니다', error);
        triggerAlert('견적 정보 조회 중 오류가 발생했습니다', 'error');
    }
};

const propDialog = ref(false);

const openOpportunityDialog = () => {
    propDialog.value = true;
};

const propData = ref([]);
const selectedProposal = ref(null);

const propHeaders = ref([
    { title: '제안명', key: 'name', sortable: false },
    { title: '제출일', key: 'submitDate', sortable: false }
]);

const fetchProposals = async () => {
    try {
        const response = await api.post('/proposals/popUp', searchCond);
        propData.value = response.data;
    } catch (error) {
        console.error('제안서 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const selectProp = (proposal) => {
    Object.assign(estimateData, {
        propNo: proposal.propNo,
        propName: proposal.name,
        company: proposal.company,
        customerName: proposal.custName,
        userName: proposal.userName
    });

    propDialog.value = false;
};

const handlePropRowClick = (proposal) => {
    selectedProposal.value = proposal;
};

const handlePropRowDblClick = () => {
    if (selectedProposal.value != null) {
        selectProp(selectedProposal.value);
    } else {
        alert('제안서를 선택하지 않았습니다!');
    }
};

watch(
    () => propDialog.value,
    (val) => {
        if (val) {
            fetchProposals();
        } else {
            searchCond.propName = '';
        }
    }
);

const totalQuantity = computed(() => (isMounted.value ? estimateData.products.reduce((acc, p) => acc + p.qty, 0) : estimateData.prodCnt));

const totalSupplyAmount = computed(() =>
    isMounted.value ? estimateData.products.reduce((acc, p) => acc + p.supplyPrice, 0) : estimateData.supplyPrice
);

const totalTaxAmount = computed(() => (isMounted.value ? estimateData.products.reduce((acc, p) => acc + p.tax, 0) : estimateData.tax));

const totalAmt = computed(() =>
    isMounted.value ? estimateData.products.reduce((acc, p) => acc + p.totalAmt, 0) : estimateData.totalPrice
);

watch(totalQuantity, (newTotalQty) => {
    estimateData.prodCnt = newTotalQty;
});

watch(totalSupplyAmount, (newTotalSupAmt) => {
    estimateData.supplyPrice = newTotalSupAmt;
});

watch(totalTaxAmount, (newTotalTaxAmt) => {
    estimateData.tax = newTotalTaxAmt;
});

watch(totalAmt, (newTotalAmt) => {
    estimateData.totalPrice = newTotalAmt;
});

const formattedTotal = {
    quantity: computed(() => formatNumber(totalQuantity.value)),
    supplyAmount: computed(() => formatNumber(totalSupplyAmount.value)),
    taxAmount: computed(() => formatNumber(totalTaxAmount.value)),
    totalAmount: computed(() => formatNumber(totalAmt.value))
};

const prodDialog = ref(false);

const openProductDialog = () => {
    prodDialog.value = true;
};

const prodData = ref([]);
const selectedProduct = ref(null);

const prodHeaders = ref([
    { title: '제품코드', key: 'prodCode', sortable: false },
    { title: '제품명', key: 'name', sortable: false },
    { title: '규격', key: 'field', sortable: false }
]);

const fetchProducts = async () => {
    try {
        const response = await api.get('/admin/products');
        prodData.value = response.data.result;
    } catch (error) {
        console.error('제품 정보를 불러오는 중 오류가 발생했습니다:', error);
    }
};

const handleProdRowClick = (product) => {
    selectedProduct.value = product;
};

const handleProdRowDblClick = () => {
    if (selectedProduct.value != null) {
        addProduct(selectedProduct.value);
    } else {
        alert('제품을 선택하지 않았습니다!');
    }
};

watch(
    () => prodDialog.value,
    (newVal) => {
        if (newVal) {
            fetchProducts();
        }
    }
);

const addProduct = (product) => {
    const newProduct = {
        ...product,
        unitAmt: product.price ?? 0,
        discount: product.discount ?? 0,
        qty: product.quantity ?? 1,
        taxRate: product.taxRate ?? 10
    };

    updateProduct(newProduct);
    estimateData.products.push(newProduct);
    prodDialog.value = false;
};

const updateProduct = (product) => {
    product.unitPropAmt = product.unitAmt - Math.floor((product.unitAmt * product.discount) / 100);
    product.supplyPrice = product.unitPropAmt * product.qty;
    product.tax = Math.floor(product.supplyPrice * (product.taxRate / 100));
    product.totalAmt = product.supplyPrice + product.tax;
};

const removeProduct = (index) => {
    estimateData.products.splice(index, 1);
};

const getFormattedField = (field) => {
    return estimateData.products.map((product) => formatNumber(product[field]));
};

const formattedProductSalePrice = computed(() => getFormattedField('unitPropAmt'));
const formattedProductSupplyAmount = computed(() => getFormattedField('supplyPrice'));
const formattedProductTaxAmount = computed(() => getFormattedField('tax'));
const formattedProductTotalAmount = computed(() => getFormattedField('totalAmt'));

const onlyNumbersRule = [(v) => /^\d*$/.test(v) || '숫자만 입력할 수 있습니다.'];
const percentageRule = [(v) => (v >= 0 && v <= 100) || '0에서 100 사이의 숫자만 입력 가능합니다.'];

const requiredFields = ref({
    name: false,
    propName: false,
    estDate: false,
    taxCls: false,
    surtaxYn: false
});

const validateRequiredFields = () => {
    let isValid = true;

    for (const key in requiredFields.value) {
        if (!estimateData[key]) {
            requiredFields.value[key] = true;
            isValid = false;
        } else {
            requiredFields.value[key] = false;
        }
    }

    return isValid;
};

const saveEstimate = async () => {
    if (estimateData.products.length === 0) {
        triggerAlert('최소 하나의 제품을 추가해야 합니다.', 'warning');
        return;
    }

    if (!validateRequiredFields()) {
        triggerAlert('모든 필수 항목을 입력해 주세요.', 'warning');
        return;
    }

    if (estimateData.estNo != null) {
        try {
            const response = await api.patch(`/estimates/${estimateData.estNo}`, estimateData);

            if (response.data.isSuccess) {
                triggerAlert('수정이 완료됐습니다.', 'success', 2000, '/sales/estimates');
            } else {
                triggerAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('견적 수정 중 오류 발생했습니다.', error);
            triggerAlert('수정에 실패했습니다.', 'error');
        }
    } else {
        try {
            const response = await api.post('/estimates', estimateData);

            if (response.data.isSuccess) {
                triggerAlert('저장이 완료됐습니다.', 'success', 2000, '/sales/estimates');
            } else {
                triggerAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('견적 저장 중 오류 발생했습니다.', error);
            triggerAlert('저장에 실패했습니다.', 'error');
        }
    }
};

const deleteEstimate = async () => {
    const estNo = estimateData.estNo;
    showConfirmDialogs.value = false;

    if (estNo != null) {
        try {
            const response = await api.delete(`/estimates/${estNo}`);

            if (response.data.isSuccess) {
                triggerAlert(response.data.result, 'success', 2000, '/sales/estimates');
            } else {
                triggerAlert(response.data.message, 'error');
            }
        } catch (error) {
            console.error('견적 삭제 중 오류가 발생했습니다.', error);
            triggerAlert('삭제에 실패했습니다.', 'error');
        }
    } else {
        triggerAlert('견적번호가 존재하지 않습니다.', 'warning');
    }
};

const generatePdf = async () => {
    const estNo = estimateData.estNo;

    if (estNo != null) {
        try {
            const response = await api.post('/report/estimate', estimateData, {
                responseType: 'blob'
            });

            const fileURL = window.URL.createObjectURL(new Blob([response.data]));
            const fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'estimate.pdf');
            document.body.appendChild(fileLink);
            fileLink.click();
            document.body.removeChild(fileLink);
        } catch (error) {
            console.error('견적서 pdf 생성 중 오류가 발생했습니다.', error);
            triggerAlert('PDF 생성에 실패했습니다.', 'error');
        }
    } else {
        triggerAlert('견적번호가 존재하지 않습니다.', 'warning');
    }
};

const goToList = () => {
    router.push('/sales/estimates');
};

onMounted(() => {
    const estNo = route.params.estNo;

    if (estNo != null) {
        fetchData(estNo);
    }

    isMounted.value = true;
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-container>
        <v-row>
            <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
            <v-col cols="7">
                <v-card elevation="10">
                    <ConfirmDialogs :dialog="showConfirmDialogs" @agree="deleteEstimate" @disagree="() => (showConfirmDialogs = false)" />
                    <v-dialog v-model="propDialog" max-width="800">
                        <v-card>
                            <v-card-title class="headline"> 제안 조회 </v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="10">
                                        <v-text-field label="제안명" v-model="searchCond.propName" clearable></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-btn @click="fetchProposals" color="primary">검색</v-btn>
                                    </v-col>
                                </v-row>
                                <v-data-table
                                    :headers="propHeaders"
                                    :items="propData"
                                    item-value="propNo"
                                    class="border rounded-md"
                                    items-per-page="5"
                                >
                                    <template v-slot:item="{ item }">
                                        <tr
                                            :class="{
                                                'highlighted-row': selectedProposal && selectedProposal.propNo === item.propNo
                                            }"
                                            @click="handlePropRowClick(item)"
                                            @dblclick="handlePropRowDblClick"
                                        >
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.submitDate }}</td>
                                        </tr>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="handlePropRowDblClick">선택</v-btn>
                                <v-btn color="error" @click="propDialog = false">닫기</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="prodDialog" max-width="800">
                        <v-card>
                            <v-card-title class="headline"> 물품 조회 </v-card-title>
                            <v-card-text>
                                <v-data-table
                                    :headers="prodHeaders"
                                    :items="prodData"
                                    item-value="prodNo"
                                    class="border rounded-md"
                                    items-per-page="5"
                                >
                                    <template v-slot:item="{ item }">
                                        <tr
                                            :class="{
                                                'highlighted-row': selectedProduct && selectedProduct.prodNo === item.prodNo
                                            }"
                                            @click="handleProdRowClick(item)"
                                            @dblclick="handleProdRowDblClick"
                                        >
                                            <td>{{ item.prodCode }}</td>
                                            <td>{{ item.name }}</td>
                                            <td>{{ item.field }}</td>
                                        </tr>
                                    </template>
                                </v-data-table>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="handleProdRowDblClick">선택</v-btn>
                                <v-btn color="error" @click="prodDialog = false">닫기</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-card-title>
                        <h3>견적 정보</h3>
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">견적명<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="estimateData.name"
                                    :error-messages="requiredFields.name ? '필수 항목입니다.' : ''"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">고객사</v-label>
                                <v-text-field v-model="estimateData.company" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">고객</v-label>
                                <v-text-field v-model="estimateData.customerName" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">제안<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="estimateData.propName"
                                    readonly
                                    append-inner-icon="mdi-magnify"
                                    @click:append-inner="openOpportunityDialog"
                                    :error-messages="requiredFields.propName ? '필수 항목입니다.' : ''"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">견적일<span class="require">*</span></v-label>
                                <v-text-field
                                    type="date"
                                    v-model="estimateData.estDate"
                                    :error-messages="requiredFields.estDate ? '필수 항목입니다.' : ''"
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">과세구분<span class="require">*</span></v-label>
                                <v-select
                                    v-model="estimateData.taxCls"
                                    :items="taxClasses"
                                    item-props="true"
                                    item-title="text"
                                    item-value="value"
                                    :error-messages="requiredFields.taxCls ? '필수 항목입니다.' : ''"
                                    outlined
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">단가구분<span class="require">*</span></v-label>
                                <v-select
                                    v-model="estimateData.surtaxYn"
                                    :items="surtaxOptions"
                                    item-props="true"
                                    item-title="text"
                                    item-value="value"
                                    :error-messages="requiredFields.surtaxYn ? '필수 항목입니다.' : ''"
                                    outlined
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">수량</v-label>
                                <v-text-field :value="formattedTotal.quantity.value" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">공급가액</v-label>
                                <v-text-field :value="formattedTotal.supplyAmount.value" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">세액</v-label>
                                <v-text-field :value="formattedTotal.taxAmount.value" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">합계금액</v-label>
                                <v-text-field :value="formattedTotal.totalAmount.value" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-label class="mb-2 font-weight-medium">담당자</v-label>
                                <v-text-field v-model="estimateData.userName" readonly></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-btn color="primary" class="mr-2" flat @click="saveEstimate">{{ saveBtn }}</v-btn>
                                <v-btn v-if="saveBtn == '수정'" color="error" class="mr-2" @click="showConfirmDialogs = true">삭제</v-btn>
                                <v-btn v-if="saveBtn == '수정'" color="secondary" class="mr-2" @click="generatePdf">
                                    <v-icon left>mdi-file-export</v-icon>PDF 다운</v-btn
                                >
                                <v-btn class="ml-" variant="outlined" color="primary" @click="goToList">목록으로 돌아가기</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="5">
                <v-card elevation="10">
                    <v-card-title>
                        <h3>제품 ({{ estimateData.products.length }})</h3>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-row v-for="(product, index) in estimateData.products" :key="index" class="mb-3">
                            <v-col cols="12">
                                <v-card elevation="3">
                                    <v-card-title>
                                        <span>{{ product.name }} / {{ product.unit }}</span>
                                        <v-spacer></v-spacer>
                                        <v-btn icon @click="removeProduct(index)">
                                            <v-icon color="red">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-card-title>
                                    <v-divider></v-divider>
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">단가</v-label>
                                                <v-text-field
                                                    v-model="product.unitAmt"
                                                    @input="updateProduct(product)"
                                                    outlined
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">할인 (%)</v-label>
                                                <v-text-field
                                                    v-model="product.discount"
                                                    @input="updateProduct(product)"
                                                    :rules="percentageRule"
                                                    type="number"
                                                    outlined
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">판매단가</v-label>
                                                <v-text-field :value="formattedProductSalePrice[index]" outlined readonly></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">수량</v-label>
                                                <v-text-field v-model="product.qty" @input="updateProduct(product)" outlined></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">세율 (%)</v-label>
                                                <v-text-field
                                                    v-model="product.taxRate"
                                                    @input="updateProduct(product)"
                                                    :rules="percentageRule"
                                                    type="number"
                                                    outlined
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">공급가액</v-label>
                                                <v-text-field :value="formattedProductSupplyAmount[index]" outlined readonly></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">세액</v-label>
                                                <v-text-field :value="formattedProductTaxAmount[index]" outlined readonly></v-text-field>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-label class="mb-2 font-weight-medium">합계금액</v-label>
                                                <v-text-field :value="formattedProductTotalAmount[index]" outlined readonly></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-btn color="primary" block @click="openProductDialog">+ 제품 추가</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss" scoped>
.require {
    color: red;
}

.text-right {
    text-align: right;
}

.highlighted-row {
    background-color: #e0f7fa;
}
</style>
