<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import { filter } from 'lodash';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const router = useRouter();
const route = useRoute();

const supplyPriceDisplay = ref('0');
const prodCntDisplay = ref('0');
const taxDisplay = ref('0');
const totalPriceDisplay = ref('0');
const unitAmtDisplay = ref('0');
const discountDisplay = ref('0');
const unitPropAmtDisplay = ref('0');
const qtyDisplay = ref('0');
const estSupplyPriceDisplay = ref('0');
const estTaxDisplay = ref('0');
const totalAmtDisplay = ref('0');

const formatNumber = (value) => new Intl.NumberFormat().format(value);

const filterNumericInput = (value) => value.replace(/[^\d]/g, '');

const updateValue = (e, field, displayRef, itemRef) => {
    const rawValue = filterNumericInput(e.target.value);
    itemRef.value[field] = parseInt(rawValue) || 0;
    displayRef.value = formatNumber(itemRef.value[field]);
};

const updateSupplyPrice = (e) => updateValue(e, 'supplyPrice', supplyPriceDisplay, createItem);
const updateProdCnt = (e) => updateValue(e, 'prodCnt', prodCntDisplay, createItem);
const updateTax = (e) => updateValue(e, 'tax', taxDisplay, createItem);
const updateTotalPrice = (e) => updateValue(e, 'totalPrice', totalPriceDisplay, createItem);
const updateUnitAmt = (e) => updateValue(e, 'unitAmt', unitAmtDisplay, productEditedItem);
const updateDiscount = (e) => updateValue(e, 'discount', discountDisplay, productEditedItem);
const updateUnitPropAmt = (e) => updateValue(e, 'unitPropAmt', unitPropAmtDisplay, productEditedItem);
const updateQty = (e) => updateValue(e, 'qty', qtyDisplay, productEditedItem);
const updateEstSupplyPrice = (e) => updateValue(e, 'supplyPrice', estSupplyPriceDisplay, productEditedItem);
const updateEstTax = (e) => updateValue(e, 'tax', estTaxDisplay, productEditedItem);
const updateTotalAmt = (e) => updateValue(e, 'totalAmt', totalAmtDisplay, productEditedItem);

const page = ref({ title: '견적 등록' });
const breadcrumbs = ref([
    { text: '견적 목록', disabled: false, href: '/estimates' },
    { text: '견적 등록', disabled: true, href: '/estimates/detail' }
]);

const headers = [
    { title: '제안명', key: 'name', sortable: false },
    { title: '제출일', key: 'submitDate', sortable: false }
];

const headersProd = [
    { title: '제품코드', key: 'prodCode', sortable: false },
    { title: '제품명', key: 'name', sortable: false },
    { title: '규격', key: 'field', sortable: false }
];

const valid = ref(false);
const form = ref(null);

const createItem = ref({
    estNo: null,
    propNo: null,
    propName: '',
    estProdNo: null,
    name: '',
    estDate: '',
    taxCls: '',
    surtaxYn: '',
    prodCnt: 0,
    supplyPrice: 0,
    tax: 0,
    totalPrice: 0,
    note: '',
    estProducts: []
});

const productEditedItem = ref({
    estProdNo: null,
    prodNo: null,
    prodName: '',
    unitAmt: 0,
    discount: 0,
    unitPropAmt: 0,
    qty: 0,
    supplyPrice: 0,
    tax: 0,
    totalAmt: 0
});

const fetchEstimateDetails = async (estNo) => {
    try {
        const response = await api.get(`/estimates/${estNo}`);
        const result = response.data.result;
        console.log('Estimate Details:', result);

        Object.assign(createItem.value, {
            estNo: result.estNo,
            propNo: result.propNo,
            name: result.name,
            propName: result.propName,
            estDate: result.estDate,
            taxCls: result.taxCls,
            surtaxYn: result.surtaxYn,
            prodCnt: result.prodCnt,
            supplyPrice: result.supplyPrice,
            tax: result.tax,
            totalPrice: result.totalPrice,
            note: result.note,
            estProducts: result.estProducts || []
        });
        if (createItem.value.estProducts.length > 0) {
            const firstProduct = createItem.value.estProducts[0];
            Object.assign(productEditedItem.value, {
                estProdNo: firstProduct.estProdNo,
                prodNo: firstProduct.prodNo,
                prodName: firstProduct.prodName,
                unitAmt: firstProduct.unitAmt,
                discount: firstProduct.discount,
                unitPropAmt: firstProduct.unitPropAmt,
                qty: firstProduct.qty,
                supplyPrice: firstProduct.supplyPrice,
                tax: firstProduct.tax,
                totalAmt: firstProduct.totalAmt
            });
        }
    } catch (error) {
        console.error('Error fetching estimate details:', productEditedItem.value);
    }
};

onMounted(async () => {
    await fetchProposals();
    await fetchProducts();
    const estNo = route.params.estNo;
    if (estNo) {
        await fetchEstimateDetails(estNo);
    }
});

const taxClasses = ['매출과세', '매출면세', '수출영세'];
const surtaxOptions = ['부가세 미포함', '부가세 포함'];

const proposals = ref([]);
const selectedProposal = ref(null);
const proposalDialog = ref(false);

const products = ref([]);
const selectedProduct = ref(null);
const productDialog = ref(false);

const estProducts = ref([]);

const handleRowClick = (proposal) => {
    selectedProposal.value = proposal;
};

const handleProductRowClick = (product) => {
    selectedProduct.value = product;
};

const handleRowDbClick = () => {
    if (selectedProposal.value != null) {
        console.log('Selected proposal:', selectedProposal.value);
        selectProposal(selectedProposal.value);
    } else {
        alert('제안서를 선택하지 않았습니다.');
    }
};

const handleProductRowDbClick = () => {
    if (selectedProduct.value != null) {
        console.log('Selected product:', selectedProduct.value);
        selectProduct(selectedProduct.value);
        addProductToEstimate();
    } else {
        alert('상품을 선택하지 않았습니다.');
    }
};

const selectProposal = (proposal) => {
    createItem.value.propNo = proposal.propNo;
    createItem.value.propName = proposal.name;
    console.log('proposal selected:', createItem.propNo);
    proposalDialog.value = false;
};

const selectProduct = (product) => {
    productEditedItem.value.prodNo = product.prodNo;
    productEditedItem.value.prodName = product.name;
    console.log('product selected:', productEditedItem.value);
    productDialog.value = false;
};

const fetchProposals = async () => {
    try {
        const response = await api.get('/proposals');
        if (Array.isArray(response.data)) {
            proposals.value = response.data.map((proposal) => ({
                propNo: proposal.propNo,
                name: proposal.name,
                submitDate: proposal.submitDate
            }));
        } else {
            console.error('Expected an array but got:', response.data);
        }
    } catch (error) {
        console.error('Failed to fetch proposals:', error.response ? error.response.data : error.message);
    }
};

const fetchProducts = async () => {
    try {
        const response = await api.get('/admin/products');
        if (Array.isArray(response.data.result)) {
            products.value = response.data.result.map((product) => ({
                prodNo: product.prodNo,
                name: product.name,
                prodCode: product.prodCode,
                field: product.field
            }));
        }
    } catch (error) {
        console.error('Failed to fetch products:', error.response ? error.response.data : error.message);
    }
};

const addProductToEstimate = () => {
    createItem.value.estProducts.push({ ...productEditedItem.value });
    console.log('Product added to estProducts:', productEditedItem.value);
};

const save = async () => {
    console.log('Save function called');

    try {
        const estimateData = {
            ...createItem.value,
            estProducts: createItem.value.estProducts.map(() => ({
                estProdNo: productEditedItem.value.estProdNo,
                prodNo: productEditedItem.value.prodNo,
                prodName: productEditedItem.value.prodName,
                unitAmt: productEditedItem.value.unitAmt,
                discount: productEditedItem.value.discount,
                unitPropAmt: productEditedItem.value.unitPropAmt,
                qty: productEditedItem.value.qty,
                supplyPrice: productEditedItem.value.supplyPrice,
                tax: productEditedItem.value.tax,
                totalAmt: productEditedItem.value.totalAmt
            }))
        };

        const response = await api.post('/estimates', estimateData);
        triggerAlert('견적이 등록되었습니다.', 'success', 2000, '/estimates');
    } catch (error) {
        console.error('Failed to create estimate:', error.response ? error.response.data : error.message);
        errorAlert.value = true;
        alertDialog.value = true;
    }
};

const cancel = () => {
    router.push('/estimates');
};

const alertDialog = ref(false);
const errorAlert = ref(false);
</script>

<template>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <div>
        <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

        <v-container>
            <v-row>
                <!-- 견적 등록 Section -->
                <v-col cols="12" md="6" class="d-flex align-stretch">
                    <UiParentCard title="견적 등록" class="fill-height">
                        <v-form ref="form" v-model="valid" @submit.prevent="save">
                            <v-row>
                                <!-- 견적명 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">견적명<span class="require">*</span></v-label>
                                    <v-text-field
                                        v-model="createItem.name"
                                        :rules="[(v) => !!v || '견적명을 입력해주세요']"
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 견적일 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">견적일<span class="require">*</span></v-label>
                                    <v-text-field
                                        v-model="createItem.estDate"
                                        type="date"
                                        :rules="[(v) => !!v || '견적일을 선택해주세요']"
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 제안 (Proposal) -->
                                <v-dialog v-model="proposalDialog" max-width="800">
                                    <v-card>
                                        <v-card-title class="headline"> 제안 조회</v-card-title>
                                        <v-card-text>
                                            <v-data-table
                                                :headers="headers"
                                                :items="proposals"
                                                item-value="propNo"
                                                class="border rounded-md"
                                                items-per-page="5"
                                            >
                                                <template v-slot:item="{ item }">
                                                    <tr
                                                        :class="{
                                                            'highlighted-row': selectedProposal && selectedProposal.propNo === item.propNo
                                                        }"
                                                        @click="handleRowClick(item)"
                                                        @dblclick="handleRowDbClick"
                                                    >
                                                        <td>{{ item.name }}</td>
                                                        <td>{{ item.submitDate }}</td>
                                                    </tr>
                                                </template>
                                            </v-data-table>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="primary" @click="handleRowDbClick">선택</v-btn>
                                            <v-btn color="error" @click="proposalDialog = false">닫기</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">제안<span class="require">*</span></v-label>
                                    <v-text-field
                                        v-model="createItem.propName"
                                        :rules="[(v) => !!v || '제안서를 선택해주세요']"
                                        append-inner-icon="mdi-magnify"
                                        @click:append-inner="proposalDialog = true"
                                        class="clickable-field"
                                    ></v-text-field>
                                </v-col>

                                <!-- 과세구분 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">과세구분<span class="require">*</span></v-label>
                                    <v-select
                                        v-model="createItem.taxCls"
                                        :items="taxClasses"
                                        :rules="[(v) => !!v || '과세구분을 선택해주세요']"
                                        outlined
                                    ></v-select>
                                </v-col>

                                <!-- 단가구분 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">단가구분<span class="require">*</span></v-label>
                                    <v-select
                                        v-model="createItem.surtaxYn"
                                        :items="surtaxOptions"
                                        :rules="[(v) => !!v || '단가구분을 선택해주세요']"
                                        outlined
                                    ></v-select>
                                </v-col>

                                <!-- 수량 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">수량<span class="require">*</span></v-label>
                                    <v-text-field v-model="prodCntDisplay" variant="outlined" @input="updateProdCnt"></v-text-field>
                                </v-col>

                                <!-- 공급가액 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">공금가액(원)<span class="require">*</span></v-label>
                                    <v-text-field v-model="supplyPriceDisplay" variant="outlined" @input="updateSupplyPrice"></v-text-field>
                                </v-col>

                                <!-- 세액 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">세액(원)<span class="require">*</span></v-label>
                                    <v-text-field v-model="taxDisplay" variant="outlined" @input="updateTax"></v-text-field>
                                </v-col>

                                <!-- 합계금액 -->
                                <v-col cols="12" sm="6">
                                    <v-label class="mb-2 font-weight-medium">합계금액(원)<span class="require">*</span></v-label>
                                    <v-text-field v-model="totalPriceDisplay" variant="outlined" @input="updateTotalPrice"></v-text-field>
                                </v-col>

                                <!-- 비고 (Notes) -->
                                <v-col cols="12">
                                    <v-label class="font-weight-medium mb-2">비고</v-label>
                                    <v-textarea v-model="createItem.note" outlined></v-textarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </UiParentCard>
                </v-col>

                <!-- 제품 등록 Section -->
                <v-col cols="12" md="6" class="d-flex align-stretch">
                    <UiParentCard title="제품 등록" class="fill-height">
                        <v-form ref="form" v-model="valid" @submit.prevent="save">
                            <!-- 제품 리스트 -->
                            <v-dialog v-model="productModal" max-width="600px">
                                <v-card>
                                    <v-card-title class="d-flex justify-space-between">
                                        <span>제품 리스트</span>
                                        <v-btn icon @click="closeProductModal">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-list>
                                            <v-list-item-group color="primary">
                                                <v-list-item
                                                    v-for="product in products"
                                                    :key="product.prodNo"
                                                    @click="selectProduct(product)"
                                                >
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{ product.name }}</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-card-text>
                                </v-card>
                            </v-dialog>

                            <v-dialog v-model="productDialog" max-width="800">
                                <v-card>
                                    <v-card-title class="headline"> 제품 조회</v-card-title>
                                    <v-card-text>
                                        <v-data-table
                                            :headers="headersProd"
                                            :items="products"
                                            item-value="prodNo"
                                            class="border rounded-md"
                                            items-per-page="5"
                                        >
                                            <template v-slot:item="{ item }">
                                                <tr
                                                    :class="{
                                                        'highlighted-row': selectedProduct && selectedProduct.prodNo === item.prodNo
                                                    }"
                                                    @click="handleProductRowClick(item)"
                                                    @dblclick="handleProductRowDbClick"
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
                                        <v-btn color="primary" @click="handleProductRowDbClick">선택</v-btn>
                                        <v-btn color="error" @click="productDialog = false">닫기</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">제품<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="productEditedItem.prodName"
                                    :rules="[(v) => !!v || '제품을 선택해주세요']"
                                    append-inner-icon="mdi-magnify"
                                    @click:append-inner="productDialog = true"
                                    class="clickable-field"
                                    readonly
                                ></v-text-field>
                            </v-col>

                            <!-- 과세구분 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">과세구분<span class="require">*</span></v-label>
                                <v-select
                                    v-model="createItem.taxCls"
                                    :items="taxClasses"
                                    :rules="[(v) => !!v || '과세구분을 선택해주세요']"
                                    outlined
                                ></v-select>
                            </v-col>

                            <!-- 견적별 제품 단가 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">단가(원)<span class="require">*</span></v-label>
                                <v-text-field v-model="unitAmtDisplay" variant="outlined" @input="updateUnitAmt"></v-text-field>
                            </v-col>

                            <!-- 할인율 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">할인율(%)<span class="require">*</span></v-label>
                                <v-text-field v-model="discountDisplay" variant="outlined" @input="updateDiscount"></v-text-field>
                            </v-col>

                            <!-- 판매단가 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">판매단가(원)<span class="require">*</span></v-label>
                                <v-text-field v-model="unitPropAmtDisplay" variant="outlined" @input="updateUnitPropAmt"></v-text-field>
                            </v-col>

                            <!-- 수량 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">수량<span class="require">*</span></v-label>
                                <v-text-field v-model="qtyDisplay" variant="outlined" @input="updateQty"></v-text-field>
                            </v-col>

                            <!-- 공급가액 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">공급가액(원)<span class="require">*</span></v-label>
                                <v-text-field
                                    v-model="estSupplyPriceDisplay"
                                    variant="outlined"
                                    @input="updateEstSupplyPrice"
                                ></v-text-field>
                            </v-col>

                            <!-- 세액 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">세액(원)<span class="require">*</span></v-label>
                                <v-text-field v-model="estTaxDisplay" variant="outlined" @input="updateEstTax"></v-text-field>
                            </v-col>

                            <!-- 합계 -->
                            <v-col cols="12" sm="6">
                                <v-label class="mb-2 font-weight-medium">합계(원)<span class="require">*</span></v-label>
                                <v-text-field v-model="totalAmtDisplay" variant="outlined" @input="updateTotalAmt"></v-text-field>
                            </v-col>
                        </v-form>
                    </UiParentCard>
                </v-col>
            </v-row>
            <v-row justify="end">
                <v-btn color="primary" class="mr-2" flat @click="save">저장</v-btn>
                <v-btn class="mr-3" variant="outlined" color="primary" @click="cancel">목록으로 돌아가기</v-btn>
                <!-- <BaseButton class="mr-2" label="저장" type="save" context="form" @click="save"/>
                    <BaseButton class="mr-3" label="목록으로 돌아가기" type="back" context="form" @click="cancel"/> -->
            </v-row>
        </v-container>
    </div>
</template>

<style>
.ui-card {
    min-height: 600px;
}
.v-col {
    display: flex;
    flex-direction: column;
}

.require {
    color: red;
}

.clickable-field {
    cursor: pointer;
}

.highlighted-row {
    background-color: #e0f7fa;
}
</style>
