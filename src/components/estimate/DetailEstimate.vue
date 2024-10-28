<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/api/axiosinterceptor';

const router = useRouter();
const route = useRoute();

const breadcrumbs = ref([
    { text: '견적 목록', disabled: false, href: '/estimates' },
    { text: '견적 상세페이지', disabled: true, href: '/estimates/form' }
]);

const valid = ref(false);
const form = ref(null);

const editedItem = ref({
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
    qty: 0,
    totalAmt: 0
});

const fetchEstimateDetails = async (estNo) => {
    try {
        const response = await api.get(`/estimates/${estNo}`);
        const result = response.data.result;
        console.log('Estimate Details:', result);

        Object.assign(editedItem.value, {
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

        if (editedItem.value.estProducts.length > 0) {
            const firstProduct = editedItem.value.estProducts[0];
            Object.assign(productEditedItem.value, {
                estProdNo: firstProduct.estProdNo,
                prodNo: firstProduct.prodNo,
                prodName: firstProduct.prodName,
                unitAmt: firstProduct.unitAmt,
                discount: firstProduct.discount,
                qty: firstProduct.qty,
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

onMounted(async () => {
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
});

const products = ref([]);
const productModal = ref(false);

// Fetch 제품
onMounted(async () => {
    try {
        const response = await api.get('/products');
        if (Array.isArray(response.data.result)) {
            products.value = response.data.result.map((product) => ({
                prodNo: product.prodNo,
                name: product.name
            }));
        }
    } catch (error) {
        console.error('Failed to fetch products:', error.response ? error.response.data : error.message);
    }
});

// 제안 모달
const openProposalModal = () => {
    proposalModal.value = true;
};
const closeProposalModal = () => {
    proposalModal.value = false;
};
const selectProposal = (proposal) => {
    editedItem.value.propNo = proposal.propNo;
    editedItem.value.propName = proposal.name;
    closeProposalModal();
};

const openProductModal = () => {
    productModal.value = true;
};
const closeProductModal = () => {
    productModal.value = false;
};

const selectProduct = (product) => {
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
        const response = await api.get('/products');
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

const fetchEstProducts = async () => {
    if (editedItem.value.estNo) {
        try {
            const response = await api.get(`/estProducts/${editedItem.value.estNo}`);
            console.log('Fetched Estimate Products:', response.data);
            if (Array.isArray(response.data.result)) {
                editedItem.value.estProducts = response.data.result;
            }
        } catch (error) {
            console.error('Failed to fetch estimate products:', error.response ? error.response.data : error.message);
        }
    }
};
const save = async () => {
    try {
        const response = await api.patch(`/estimates/${editedItem.value.estNo}`, editedItem.value);
        const updatedEstimate = response.data;

        const productsToSave = editedItem.value.estProducts.map((product) => ({
            ...product,
            estNo: updatedEstimate.estNo
        }));

        await api.patch('/estProducts', productsToSave);

        successAlert.value = true;
        alertDialog.value = true;

        setTimeout(() => router.push('/estimates'), 1500);
    } catch (error) {
        console.error('Failed to update estimate:', error.response ? error.response.data : error.message);

        errorAlert.value = true;
        alertDialog.value = true;
    }
};

const cancel = () => {
    router.push('/estimates');
};

const alertDialog = ref(false);
const successAlert = ref(false);
const errorAlert = ref(false);
const warningAlert = ref(false);
</script>

<template>
    <v-dialog v-model="alertDialog" max-width="500" class="dialog-mw">
        <v-card>
            <v-card-text>
                <v-alert v-if="successAlert" type="success" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Success</h5>
                    <div>견적이 성공적으로 수정되었습니다.</div>
                </v-alert>
                <v-alert v-if="errorAlert" type="error" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Error</h5>
                    <div>견적 수정에 실패했습니다. 다시 시도해주세요.</div>
                </v-alert>
                <v-alert v-if="warningAlert" type="warning" variant="tonal" class="mb-4">
                    <h5 class="text-h6 text-capitalize">Warning</h5>
                    <div>필수 항목을 입력해주세요.</div>
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click="alertDialog = false" flat>Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <div>
        <BaseBreadcrumb :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

        <v-container>
            <v-row>
                <!-- 견적 등록 Section -->
                <v-col cols="12" md="6">
                    <UiParentCard title="견적 수정">
                        <v-form ref="form" v-model="valid" @submit.prevent="save">
                            <v-row>
                                <!-- 견적명 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="editedItem.name"
                                        label="견적명"
                                        :rules="[(v) => !!v || '견적명을 입력해주세요']"
                                        required
                                        outlined
                                    ></v-text-field>
                                </v-col>

                                <!-- 견적일 -->
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="editedItem.estDate"
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
                                        v-model="editedItem.propName"
                                        :items="proposals"
                                        item-text="name"
                                        :rules="[(v) => !!v || '제안선택 버튼을 눌러 제안서를 선택해주세요']"
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
                                        v-model="editedItem.taxCls"
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
                                        v-model="editedItem.surtaxYn"
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
                                        v-model.number="editedItem.prodCnt"
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
                                        v-model.number="editedItem.supplyPrice"
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
                                        v-model.number="editedItem.tax"
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
                                        v-model.number="editedItem.totalPrice"
                                        label="합계금액"
                                        type="number"
                                        min="0"
                                        required
                                        outlined
                                        readonly
                                    ></v-text-field>
                                </v-col>

                                <!-- 비고 (Notes) -->
                                <v-col cols="12">
                                    <v-textarea v-model="editedItem.note" label="비고" outlined></v-textarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </UiParentCard>
                </v-col>

                <!-- 제품 수정 Section -->
                <v-col cols="12" md="6" class="d-flex align-stretch">
                    <UiParentCard title="제품 수정" class="fill-height">
                        <v-form ref="form" v-model="valid" @submit.prevent="save">
                            <v-row>
                                <v-row v-for="product in editedItem.estProducts" :key="index">
                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model="product.prodName"
                                            label="제품명"
                                            readonly
                                            outlined
                                            :rules="[(v) => !!v || '제품명을 선택해주세요']"
                                        ></v-text-field>
                                        <v-btn color="primary" @click="openProductModal">제품 선택</v-btn>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.qty"
                                            label="수량"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '수량은 0 이상이어야 합니다']"
                                            outlined
                                            required
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.unitAmt"
                                            label="단가"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '단가는 0 이상이어야 합니다']"
                                            outlined
                                            required
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.discount"
                                            label="할인율"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '할인율은 0 이상이어야 합니다']"
                                            outlined
                                            required
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.unitPropAmt"
                                            label="판매단가"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '판매단가는 0 이상이어야 합니다']"
                                            outlined
                                            required
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.supplyPrice"
                                            label="공급가액"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '공급가액은 0 이상이어야 합니다']"
                                            outlined
                                            required
                                        ></v-text-field>
                                    </v-col>

                                    <v-col cols="12" sm="6">
                                        <v-text-field
                                            v-model.number="product.tax"
                                            label="세액"
                                            type="number"
                                            min="0"
                                            :rules="[(v) => v >= 0 || '세액은 0 이상이어야 합니다']"
                                            outlined
                                            required
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
                                </v-row>
                            </v-row>
                        </v-form>
                    </UiParentCard>
                </v-col>
            </v-row>
        </v-container>

        <!-- 제출 -->
        <v-row justify="end">
            <v-btn class="mr-2 mt-2" color="primary" variant="flat" style="font-size: 15px; font-weight: 600;" @click="save">저장</v-btn>
            <v-btn class="mr-7 mt-2" color="primary" variant="outlined" style="font-size: 15px; font-weight: 600;" @click="cancel">목록으로 돌아가기</v-btn>
        </v-row>
    </div>
</template>

<style>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.require {
    color: red;
}
</style>
