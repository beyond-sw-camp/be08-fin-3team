<template>
    <div class="filter-container">
        <v-card class="filter-box">
            <v-card-title>계약 필터</v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="filterName"
                    label="계약명"
                />
                <v-text-field
                    v-model="filterStartDate"
                    label="계약 시작 날짜"
                    type="date"
                />
                <v-text-field
                    v-model="filterEndDate"
                    label="계약 종료 날짜"
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
            default: () => ({ name: '', startDate: '', endDate: '' }),
        },
    },
    data() {
        return {
            filterName: this.modelValue.name,
            filterStartDate: this.modelValue.startDate,
            filterEndDate: this.modelValue.endDate,
        };
    },
    watch: {
        modelValue(newVal) {
            this.filterName = newVal.name;
            this.filterStartDate = newVal.startDate;
            this.filterEndDate = newVal.endDate;
        },
    },
    methods: {
        applyFilter() {
            this.$emit('update:modelValue', { 
                name: this.filterName, 
                startDate: this.filterStartDate, 
                endDate: this.filterEndDate 
            });
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
