<script setup>
import { ref, watch, computed } from 'vue';

import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    statusData: {
        type: [Object, Function, Array],
        default: () => []
    }
});

const formattedStatusData = computed(() => {
    if (!Array.isArray(props.statusData)) return [];

    const dataCopy = [...props.statusData];
    dataCopy[0].status = 'ALL';
    const allCount = dataCopy.find((item) => item.status === 'ALL')?.count || 1;

    return dataCopy.map((item) => ({
        ...item,
        percentage: item.status === 'ALL' ? 100 : parseFloat(((item.count / allCount) * 100).toFixed(2))
    }));
});

const formatNumber = (value) => {
    return new Intl.NumberFormat().format(value);
};

const getStatusName = (status) => {
    const statusNames = {
        ALL: '등록',
        PROGRESS: '진행중',
        SUCCESS: '성공',
        HOLD: '보류',
        FAIL: '실패'
    };
    return statusNames[status] || '';
};

const getColor = (status) => {
    const statusColors = {
        ALL: 'primary',
        PROGRESS: 'secondary',
        SUCCESS: 'success',
        HOLD: 'warning',
        FAIL: 'error'
    };
    return statusColors[status] || 'grey';
};
</script>

<template>
    <VCardSubtitle class="subtitle">단위 : (건/천원)</VCardSubtitle>
    <v-row>
        <v-col cols="12">
            <v-row v-for="(data, index) in formattedStatusData" :key="index" align="center" class="py-2">
                <v-col cols="3" class="d-flex align-center">
                    <v-chip size="large" :color="getColor(data.status)">
                        <span class="text-h5 chip-text">
                            {{ getStatusName(data.status) }}
                        </span>
                    </v-chip>
                </v-col>
                <v-col cols="2">
                    <v-chip :color="getColor(data.status)" text-color="black" outlined>
                        <v-icon v-if="data.status == 'ALL'" @click="router.push('/sales/lead/new')">mdi-pencil</v-icon>
                        <span v-if="data.status != 'ALL'">{{ data.percentage }}%</span>
                    </v-chip>
                </v-col>
                <v-col cols="2" class="text-center">
                    <v-chip size="large" color="grey lighten-3" text-color="black" outlined>
                        <span class="text-h5">{{ data.count }} 건</span>
                    </v-chip>
                </v-col>
                <v-col cols="5">
                    <v-chip color="grey lighten-3" text-color="black" outlined>
                        <span class="amt">{{ formatNumber(data.amt) }}</span>
                    </v-chip>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<style lang="scss" scoped>
.subtitle {
    text-align: right;
}

.chip-text {
    width: 100px;
    text-align: center;
}

.amt {
    width: 150px;
    text-align: left;
}
</style>
