<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const router = useRouter();
const route = useRoute();

const page = ref({ title: '견적 등록' });
const breadcrumbs = ref([
    { text: '견적 목록', disabled: false, href: '/estimates' },
    { text: '견적 등록', disabled: true, href: '/estimates/detail' }
]);

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
        console.error('Error fetching estimate details:', error);
    }
};

onMounted(async () => {
    await fetchProposals();
    await fetchProducts();
    const estNo = route.params.estNo;
    if (estNo) {
        await fetchEstimateDetails(estNo);
        await fetchEstProducts();
    }
});

const taxClasses = ['매출과세', '매출면세', '수출영세'];
const surtaxOptions = ['부가세 미포함', '부가세 포함'];

const proposals = ref([]);
const proposalModal = ref(false);

const products = ref([]);
const productModal = ref(false);

const estProducts = ref([]);

// 제안 모달
const openProposalModal = () => {
    proposalModal.value = true;
};
const closeProposalModal = () => {
    proposalModal.value = false;
};
const selectProposal = (proposal) => {
    createItem.value.propNo = proposal.propNo;
    createItem.value.propName = proposal.name;
    closeProposalModal();
};

const openProductModal = () => {
    productModal.value = true;
};
const closeProductModal = () => {
    productModal.value = false;
};

const selectProduct = (product) => {
    if (!createItem.value.estProducts.some((p) => p.prodNo === product.prodNo)) {
        createItem.value.estProducts.push({
            prodNo: product.prodNo,
            prodName: product.name,
            estProdNo: null,
            unitAmt: 0,
            discount: 0,
            unitPropAmt: 0,
            qty: 0,
            supplyPrice: 0,
            tax: 0,
            totalAmt: 0
        });
    }

    productEditedItem.value.prodNo = product.prodNo;
    productEditedItem.value.prodName = product.name;
    closeProductModal();
};

const fetchProposals = async () => {
    try {
        const response = await api.get('/proposals');
        if (Array.isArray(response.data)) {
            proposals.value = response.data.map((proposal) => ({
                propNo: proposal.propNo,
                name: proposal.name
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
                name: product.name
            }));
        }
    } catch (error) {
        console.error('Failed to fetch products:', error.response ? error.response.data : error.message);
    }
};

const save = async () => {
    console.log('Save function called');
    console.log('Data being sent:', createItem.value);

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
                                    <v-text-field
                                        v-model="createItem.name"
                                        label="견적명"
                                        :rules="[(v) => !!v || '견적명을 입력해주세요']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 견적일 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="createItem.estDate"
                                        label="견적일"
                                        type="date"
                                        :rules="[(v) => !!v || '견적일을 선택해주세요']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 제안 (Proposal) -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="createItem.propName"
                                        :items="proposals"
                                        item-text="name"
                                        :rules="[(v) => !!v || '제안선택 버튼을 눌러 제안서를 선택해주세요']"
                                        label="선택된 제안"
                                        readonly
                                        outlined
                                    ></v-text-field>
                                    <v-btn color="primary" @click="openProposalModal">제안 선택</v-btn>
                                </v-col>

                                <!-- 제안 모달 -->
                                <v-dialog v-model="proposalModal" max-width="600px">
                                    <v-card>
                                        <v-card-title class="d-flex justify-space-between">
                                            <span>제안 목록</span>
                                            <v-btn icon @click="closeProposalModal">
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-list>
                                                <v-list-item-group color="primary">
                                                    <v-list-item
                                                        v-for="proposal in proposals"
                                                        :key="proposal.propNo"
                                                        @click="selectProposal(proposal)"
                                                    >
                                                        <v-list-item-content>
                                                            <v-list-item-title>{{ proposal.name }}</v-list-item-title>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                                </v-list-item-group>
                                            </v-list>
                                        </v-card-text>
                                    </v-card>
                                </v-dialog>

                                <!-- 과세구분 -->
                                <v-col cols="12" sm="6">
                                    <v-select
                                        v-model="createItem.taxCls"
                                        :items="taxClasses"
                                        label="과세구분"
                                        :rules="[(v) => !!v || '과세구분을 선택해주세요']"
                                        required
                                        outlined
                                    ></v-select>
                                </v-col>

                                <!-- 단가구분 -->
                                <v-col cols="12" sm="6">
                                    <v-select
                                        v-model="createItem.surtaxYn"
                                        :items="surtaxOptions"
                                        label="단가구분"
                                        :rules="[(v) => !!v || '단가구분을 선택해주세요']"
                                        required
                                        outlined
                                    ></v-select>
                                </v-col>

                                <!-- 수량 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="createItem.prodCnt"
                                        label="수량"
                                        type="number"
                                        min="0"
                                        :rules="[(v) => v >= 0 || '수량은 0 이상이어야 합니다']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 공급가액 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="createItem.supplyPrice"
                                        label="공급가액"
                                        type="number"
                                        min="0"
                                        :rules="[(v) => v >= 0 || '공급가액은 0 이상이어야 합니다']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 세액 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="createItem.tax"
                                        label="세액"
                                        type="number"
                                        min="0"
                                        :rules="[(v) => v >= 0 || '세액은 0 이상이어야 합니다']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 합계금액 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="createItem.totalPrice"
                                        label="합계금액"
                                        type="number"
                                        min="0"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 비고 (Notes) -->
                                <v-col cols="12">
                                    <v-textarea v-model="createItem.note" label="비고" outlined></v-textarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </UiParentCard>
                </v-col>

                <!-- 제품 등록 Section -->
                <v-col cols="12" md="6" class="d-flex align-stretch">
                    <UiParentCard title="제품 등록" class="fill-height">
                        <v-form ref="form" v-model="valid" @submit.prevent="save">
                            <!-- 제품 (Product) -->
                            <v-row>
                                <v-col class="ml-3" cols="12" sm="6">
                                    <v-text-field
                                        v-model="productEditedItem.prodName"
                                        label="선택된 제품"
                                        :rules="[(v) => !!v || '제품을 선택해주세요']"
                                        readonly
                                        outlined
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="4">
                                    <v-btn color="primary" @click="openProductModal">제품 선택</v-btn>
                                </v-col>
                            </v-row>
                            <!-- 단가 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.unitAmt"
                                    label="단가"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '단가는 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 할인율 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.discount"
                                    label="할인율"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '할인율은 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 판매단가 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.unitPropAmt"
                                    label="판매단가"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '판매단가는 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 수량 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.qty"
                                    label="수량"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '수량은 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 공급가액 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.supplyPrice"
                                    label="공급가액"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '공급가액은 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 세액 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.tax"
                                    label="세액"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '세액은 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

                            <!-- 합계 -->
                            <v-col cols="12" sm="6">
                                <v-text-field
                                    v-model.number="productEditedItem.totalAmt"
                                    label="합계금액"
                                    type="number"
                                    min="0"
                                    :rules="[(v) => v >= 0 || '세액은 0 이상이어야 합니다']"
                                    required
                                    outlined
                                ></v-text-field>
                            </v-col>

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
</style>
