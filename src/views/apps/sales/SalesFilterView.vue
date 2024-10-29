<template>
    <div class="filter-container">
        <v-card class="filter-box">
            <v-card-title>매출 필터</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="filterSalesName"
                    label="매출명"
                />
                <v-select
                    v-model="filterBusinessType"
                    :items="businessTypes"
                    label="사업 유형"
                />
                <v-select
                    v-model="filterTaxClassification"
                    :items="taxClassifications"
                    label="과세 구분"
                />
                <v-text-field
                    v-model="filterStartDate"
                    label="매출 시작 날짜"
                    type="date"
                />
                <v-text-field
                    v-model="filterEndDate"
                    label="매출 종료 날짜"
                    type="date"
                />
                <v-col cols="12">
                    <v-btn class="search_btn" variant="flat" color="primary" @click="applyFilter">검색</v-btn>
                </v-col>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Object,
            default: () => ({
                salesName: '',
                businessType: '',
                taxClassification: '',
                startDate: '',
                endDate: ''
            }),
        },
    },
    data() {
        return {
            filterSalesName: this.modelValue.salesName,
            filterBusinessType: this.modelValue.businessType,
            filterTaxClassification: this.modelValue.taxClassification,
            filterStartDate: this.modelValue.startDate,
            filterEndDate: this.modelValue.endDate,
            businessTypes: ['공공', '민간', '기업', '해외'],
            taxClassifications: ['Y', 'N'],
        };
    },
    methods: {
        applyFilter() {
            this.$emit('update:modelValue', {
                salesName: this.filterSalesName,
                businessType: this.filterBusinessType,
                taxClassification: this.filterTaxClassification,
                startDate: this.filterStartDate,
                endDate: this.filterEndDate
            });
        },
    },
    watch: {
        modelValue(newVal) {
            this.filterSalesName = newVal.salesName;
            this.filterBusinessType = newVal.businessType;
            this.filterTaxClassification = newVal.taxClassification;
            this.filterStartDate = newVal.startDate;
            this.filterEndDate = newVal.endDate;
        },
    },
};
</script>

<style scoped>
.filter-box {
    box-shadow: none;
}
.search_btn {
    width: 100%;
    text-align: center;
    margin-bottom: 20px;
}
</style>