<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { EditIcon, PointFilledIcon, TrashIcon } from 'vue-tabler-icons';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import api from '@/api/axiosinterceptor';
import { reverseActStatus, actStatus } from '@/utils/ActStatusMappings';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const page = ref({ title: '영업활동 목록' });
const breadcrumbs = ref([
    {
        text: '일정관리',
        disabled: false,
        to: '#'
    },
    {
        text: '영업활동',
        disabled: true,
        to: ''
    }
]);

const search = ref();
const dialog = ref(false);
const dialogDelete = ref(false);
const headers = ref([
    { title: '활동명', key: 'name' },
    { title: '분류', key: 'purpose' },
    { title: '활동 일자', key: 'actDate' },
    { title: '완료여부', key: 'completeYn' },
    { title: '', key: 'actions', sortable: false }
]);

const actList = ref([]);
const editedItem = ref(null);

async function initialize() {
    try {
        const response = await api.get('/acts');
        actList.value = response.data.result;
    } catch (error) {
        console.error(error);
    }
}

function deleteItem(item) {
    editedItem.value = item;
    dialogDelete.value = true;
}

async function confirmDelete() {
    if (editedItem.value) {
        try {
            await api.delete(`/acts/${editedItem.value.actNo}`);
            actList.value = actList.value.filter((act) => act.actNo !== editedItem.value.actNo);
            dialogDelete.value = false;
            editedItem.value = null;
            triggerAlert('삭제가 완료되었습니다.', 'success', 2000, '/apps/act/list');
        } catch (error) {
            console.error('삭제 실패:', error);
        }
    }
}

function cancleDelete() {
    dialogDelete.value = false;
    editedItem.value = null;
}

const router = useRouter();

function goToAddAct() {
    router.push({
        path: '/apps/act',
        query: { returnTo: '/apps/act/list' }
    });
}

function goToActDetails(actNo, cls) {
    const convertedCls = reverseActStatus[cls] || cls;
    console.log(reverseActStatus[cls] || cls);
    router.push({ name: 'FormCustom', params: { actNo }, query: { cls: convertedCls } });
}

function resetSearch() {
    search.value = '';
    initialize();
}

onMounted(() => {
    initialize();
});
</script>
<template>
    <BaseBreadcrumb :title="page.title" class="" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <v-row>
        <v-col cols="12">
            <UiParentCard title="영업활동">
                <v-data-table
                    class="rounded-md datatabels actlist"
                    :headers="headers"
                    :items="actList"
                    v-model:search="search"
                    items-per-page="5"
                    item-value="actNo"
                    color="primary"
                    show-select
                >
                    <template v-slot:item.name="{ item }">
                        <h6 class="text-h6 cursor-pointer" @click="goToActDetails(item.actNo, item.cls)">{{ item.name }}</h6>
                    </template>

                    <template v-slot:item.purpose="{ item }">
                        <p>{{ item.purpose }}</p>
                    </template>

                    <template v-slot:item.actDate="{ item }">
                        <p>{{ item.actDate }}</p>
                    </template>

                    <template v-slot:item.completeYn="{ item }">
                        <div class="d-flex gap-2 align-center">
                            <PointFilledIcon v-if="item.completeYn === 'Y'" class="text-success" />
                            <PointFilledIcon v-else class="text-error" />
                            {{ item.completeYn === 'Y' ? '완료' : '미완료' }}
                        </div>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <div class="d-flex gap-2">
                            <EditIcon
                                height="20"
                                width="20"
                                class="text-primary cursor-pointer"
                                size="small"
                                @click="goToActDetails(item.actNo, item.cls)"
                            />
                            <TrashIcon height="20" width="20" class="text-error cursor-pointer" size="small" @click="deleteItem(item)" />
                        </div>
                    </template>

                    <template v-slot:top>
                        <v-toolbar class="bg-surface" flat>
                            <v-text-field
                                v-model="search"
                                append-inner-icon="mdi-magnify"
                                label="Search"
                                single-line
                                hide-details
                                class="mb-md-0 mb-3"
                            />
                            <v-spacer></v-spacer>
                            <v-btn color="primary" variant="tonal" @click="goToAddAct">영업활동 생성</v-btn>
                        </v-toolbar>
                    </template>

                    <template v-slot:no-data>
                        <v-btn color="primary" variant="tonal" @click="resetSearch"> 초기화 </v-btn>
                    </template>
                </v-data-table>
                <ConfirmDialogs :dialog="dialogDelete" @agree="confirmDelete" @disagree="cancleDelete" />
            </UiParentCard>
        </v-col>
    </v-row>
</template>

<style>
.alert {
    position: fixed;
    top: 20%;
    left: 90%;
    transform: translateX(-50%);
    z-index: 3000;
    width: 100%;
    max-width: 17%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    font-size: 15px;
}
</style>
