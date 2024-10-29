<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api from '@/api/axiosinterceptor';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';

import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const page = ref({ title: '프로세스 관리' });
const breadcrumbs = ref([
    {
        text: '관리자',
        disabled: false,
        href: '#'
    },
    {
        text: '프로세스 관리',
        disabled: true,
        href: '#'
    }
]);

const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();

const headers1 = ref([
    { title: '서브 프로세스', align: 'start', key: 'subProcessName' },
    { title: '진행 단계', align: 'start', key: 'progressStep' },
    { title: '성공 확률(%)', align: 'start', key: 'successRate' },
    { title: '내용', align: 'start', key: 'description' },
    { title: '예상 소요 기간(일)', align: 'start', key: 'expectedDuration' },
    { title: '액션', align: 'start' },
]);

const headers2 = ref([
    { title: '프로세스', align: 'start', key: 'processName' },
    { title: '기본 프로세스', key: 'isDefault' },
    { title: '내용', key: 'description' },
    { title: '예상 소요기간', key: 'expectedDuration' },
    { title: '액션', align: 'start' },
]);

const dialog = ref(false);
const showConfirmDialog = ref(false);
const processes = ref([]);
const subProcesses = ref([]);
const editedItem = ref(null);
const dialogMode = ref('');
const selectedProcess = ref(null);
const formValid = ref(false);
const isLoading = ref(false);

watch(editedItem, validateForm, { deep: true });

// 상위 프로세스를 API로 가져오는 함수
async function fetchProcesses() {
    try {
        const response = await api.get('/admin/processes');
        processes.value = response.data.result;
    } catch (error) {
        console.error('Error fetching Sub processes:', error.message || error);
        triggerAlert('프로세스 가져오기 실패', 'error', 2000);
    }
}

// 하위 프로세스를 API로 가져오는 함수
async function fetchSubProcesses(processName) {
    isLoading.value = true;
    try {
        const response = await api.get(`/admin/subprocesses/${processName}`);
        subProcesses.value = response.data.result;
    } catch (error) {
        console.error('Error fetching Sub processes:', error.message || error);
        triggerAlert('하위 프로세스 가져오기 실패', 'error', 2000);
    } finally {
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
}
// 행 클릭 시 하위 프로세스 로드 및 선택된 프로세스 저장
function selectRow(process) {
    if (process && process.processName) {
        selectedProcess.value = process;
        fetchSubProcesses(process.processName);
    }
}

// 상위 프로세스 추가 함수
function addParentProcess() {
    editedItem.value = {
        processName: '',
        isDefault: false,
        description: '',
        expectedDuration: '',
    };
    dialogMode.value = 'add-parent';
    dialog.value = true;
    validateForm();
}

// 하위 프로세스 추가 함수
function addSubProcess() {
    if (!selectedProcess.value) {
        triggerAlert('상위 프로세스를 선택한 후 하위 프로세스를 추가하세요.', 'warning', 2000);
        return;
    }

    editedItem.value = {
        processNo: selectedProcess.value.processNo,
        subProcessName: '',
        progressStep: '',
        successRate: '',
        description: '',
        expectedDuration: '',
    };
    dialogMode.value = 'add-sub';
    dialog.value = true;
    validateForm();
}

// 상위 프로세스 저장 함수
async function saveParentProcess() {
    if (!formValid.value) return;
    try {
        if (dialogMode.value === 'add-parent') {
            const response = await api.post(`/admin/processes`, editedItem.value);
            console.log('Parent process 추가 성공:', response.data);
            triggerAlert('프로세스가 등록되었습니다.', 'success', 2000);
        } else if (dialogMode.value === 'edit-parent') {
            const response = await api.patch(`/admin/processes/${editedItem.value.processNo}`, editedItem.value);
            console.log('Parent process 수정 성공:', response.data);
            triggerAlert('프로세스가 수정되었습니다.', 'success', 2000);
        }
        dialog.value = false;
        await fetchProcesses();
    } catch (error) {
        console.error('상위 프로세스 저장 중 오류:', error.message || error);
        triggerAlert('프로세스 등록에 실패했습니다.', 'error', 2000);
    }
}

// 하위 프로세스 저장 함수
async function saveSubProcess() {
    if (!formValid.value) return;
    try {
        if (dialogMode.value === 'add-sub') {
            const response = await api.post(`/admin/subprocesses`, editedItem.value);
            console.log('Subprocess 추가 성공:', response.data);
            triggerAlert('하위 프로세스가 등록되었습니다.', 'success', 2000);
        } else if (dialogMode.value === 'edit-sub') {
            const response = await api.patch(`/admin/subprocesses/${editedItem.value.subProcessNo}`, editedItem.value);
            console.log('Subprocess 수정 성공:', response.data);
            triggerAlert('하위 프로세스가 수정되었습니다.', 'success', 2000);
        }

        dialog.value = false;

        await fetchSubProcesses(selectedProcess.value.processName);
        fetchProcesses();
    } catch (error) {
        console.error('하위 프로세스 저장 중 오류:', error.message || error);
        triggerAlert('하위 프로세스 등록에 실패했습니다.', 'error', 2000);
    }
}


// 항목 삭제
function deleteItem(item, type) {
    editedItem.value = { ...item };
    dialogMode.value = `delete-${type}`;
    // dialogDelete.value = true;
    showConfirmDialog.value = true; 
}

// 폼 유효성 검사 함수
function validateForm() {
    if (dialogMode.value === 'add-parent' || dialogMode.value === 'edit-parent') {
        formValid.value = !!editedItem.value.processName;
    } else if (dialogMode.value === 'add-sub' || dialogMode.value === 'edit-sub') {
        formValid.value = !!(
            editedItem.value.subProcessName && 
            editedItem.value.progressStep &&
            /^[0-9]+$/.test(editedItem.value.successRate) &&
            editedItem.value.expectedDuration && 
            /^[0-9]+$/.test(editedItem.value.expectedDuration)
        );
    }
}

// 항목 삭제 확정
async function confirmDelete() {
    try {
        // dialogDelete.value = false;
        showConfirmDialog.value = false;
        const apiUrl = dialogMode.value.includes('parent')
            ? `/admin/processes/${editedItem.value.processNo}`
            : `/admin/subprocesses/${editedItem.value.subProcessNo}`;
        const response = await api.delete(apiUrl);
        console.log('Delete successful:', response.data);
        triggerAlert('프로세스가 삭제되었습니다.', 'success', 2000);

        editedItem.value = null;

        if (dialogMode.value.includes('sub')) {
            await fetchSubProcesses(selectedProcess.value.processName);
        } else {
            await fetchProcesses();
        }
    } catch (error) {
        console.error('Error deleting item:', error.message || error);
        triggerAlert('프로세스 삭제에 실패했습니다.', 'error', 2000);
    }
}

// 항목 수정 함수
function editItem(item, type) {
    editedItem.value = { ...item };
    dialogMode.value = `edit-${type}`;
    dialog.value = true;
    validateForm();
}

// 초기 데이터 로드
onMounted(() => {
    fetchProcesses();
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <v-row>

        <v-col cols="12">
            <UiParentCard title="프로세스 관리">
                <v-progress-circular
                    v-if="isLoading"
                    indeterminate
                    color="primary"
                    size="50"
                    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                ></v-progress-circular>
                <v-data-table
                    class="border rounded-md"
                    :headers="headers2"
                    :items="processes"
                    item-value="processNo"
                >
                    <template v-slot:item="{ item }">
                        <tr @click="selectRow(item)" style="cursor: pointer;">
                            <td>{{ item.processName }}</td>
                            <td>
                                <i
                                    class="mr-2 mdi text-h5 mdi-bookmark-check"
                                    :style="{ color: item.isDefault ? '#4CAF50' : 'inherit' }"
                                ></i>
                            </td>
                            <td>{{ item.description }}</td>
                            <td>{{ item.expectedDuration }}</td>
                            <td>
                                <EditIcon
                                    height="20"
                                    width="20"
                                    class="mr-2 text-primary cursor-pointer"
                                    size="small"
                                    @click.stop="editItem(item, 'parent')"
                                />
                                <TrashIcon
                                    height="20"
                                    width="20"
                                    class="text-error cursor-pointer"
                                    size="small"
                                    @click.stop="deleteItem(item, 'parent')"
                                />
                            </td>
                        </tr>
                    </template>
                    <template v-slot:top>
                        <v-toolbar class="bg-lightsecondary" flat>
                            <v-toolbar-title>프로세스</v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn class="mr-3" color="primary" variant="tonal" dark @click="addParentProcess">프로세스 생성</v-btn>
                        </v-toolbar>
                        <v-col cols="12">
                            <p style = "font-weight: bold;">검색 결과: {{ processes.length }}건</p>
                        </v-col>
                    </template>
                </v-data-table>

                <v-data-table
                    class="border rounded-md mt-6"
                    :headers="headers1"
                    :items="subProcesses"
                >
                    <template v-slot:item="{ item }">
                        <tr>
                            <td>{{ item.subProcessName }}</td>
                            <td>{{ item.progressStep }}</td>
                            <td>{{ item.successRate }}</td>
                            <td>{{ item.description }}</td>
                            <td>{{ item.expectedDuration }}</td>
                            <td>
                                <EditIcon
                                    height="20"
                                    width="20"
                                    class="mr-2 text-primary cursor-pointer"
                                    size="small" 
                                    @click.stop="editItem(item, 'sub')"
                                />
                                <TrashIcon
                                    height="20"
                                    width="20"
                                    class="text-error cursor-pointer"
                                    size="small"
                                    @click.stop="deleteItem(item, 'sub')"
                                />
                            </td>
                        </tr>
                    </template>
                    <template v-slot:top>
                        <v-toolbar class="bg-lightsecondary" flat>
                            <v-toolbar-title>하위 프로세스</v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn class="mr-3" color="primary" variant="tonal" dark @click="addSubProcess">하위 프로세스 생성</v-btn>
                        </v-toolbar>
                        <v-col cols="12">
                            <!-- <p style = "font-weight: bold;">검색 결과: {{ subProcesses.length }}건</p> -->
                        </v-col>
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">
                {{ dialogMode.includes('edit') ? '프로세스 수정' : dialogMode === 'add-parent' ? '프로세스 등록' : '하위 프로세스 등록' }}
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row v-if="dialogMode === 'add-parent' || dialogMode === 'edit-parent'">
                        <v-col cols="12">
                            <v-switch label="프로세스 기본 여부" color="primary" v-model="editedItem.isDefault"></v-switch>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="editedItem.processName" label="Process Name"
                                :rules="[v => !!v || '프로세스 명은 필수 입니다.']"
                                @input="validateForm"/>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="editedItem.description" label="Description" />
                        </v-col>
                    </v-row>
                    <v-row v-else>
                        <v-col cols="12">
                            <v-text-field v-model="editedItem.subProcessName" label="Sub Process Name"
                                :rules="[v => !!v || '프로세스 명은 필수 입니다.']"
                                @input="validateForm"/>
                            <v-text-field v-model="editedItem.progressStep" label="Progress Step"
                                :rules="[v => !!v || '프로세스 단계는 필수 입니다.']"
                                @input="validateForm"/>
                            <v-text-field v-model="editedItem.successRate" label="Success Rate (%)" :rules="[v => /^[0-9]+$/.test(v) || '숫자만 입력하세요']" required/>
                            <v-text-field v-model="editedItem.description" label="Description"  required/>
                            <v-text-field v-model="editedItem.expectedDuration" label="Expected Duration"
                                :rules="[
                                        v => !!v || '예상 소요기간은 필수 입니다.',
                                        v => /^[0-9]+$/.test(v) || '숫자만 입력하세요'
                                    ]"
                                @input="validateForm"/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="dialogMode === 'add-parent' || dialogMode === 'edit-parent'" color="primary" flat style="font-size: 15px; font-weight: 600;" @click="saveParentProcess" :disabled="!formValid">저장</v-btn>
                <v-btn v-else color="primary" flat style="font-size: 15px; font-weight: 600;" @click="saveSubProcess" :disabled="!formValid">저장</v-btn>
                <v-btn flat style="font-size: 15px; font-weight: 600;" @click="dialog = false">닫기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ConfirmDialogs :dialog="showConfirmDialog" @agree="confirmDelete" @disagree="showConfirmDialog = false" />

</template>
