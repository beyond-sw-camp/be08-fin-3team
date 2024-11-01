<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <AlertComponent :show="showAlert" :message="alertMessage" :type="alertType" />
    <div class="container">
        <v-card>
            <v-card-title class="custom-card-title">
                부서 관리
            </v-card-title>
            <v-row class="pa-4" justify="space-between">
                <v-col cols="12" md="3">
                    <v-treeview
                        v-model:activated="active"
                        v-model:opened="open"
                        :items="items"
                        color="warning"
                        density="compact"
                        item-title="name"
                        item-value="no"
                        activatable
                    >
                        <template v-slot:prepend="{ item }">
                            <v-icon v-if="!item.children">
                                mdi-domain
                            </v-icon>
                        </template>
                    </v-treeview>
                </v-col>
                <v-col cols="12" md="9">
                    <v-scroll-y-transition>
                        <div>
                            <v-row class="text-right">
                                <v-col class="text-sm-left">
                                    <span class="font-weight-black custom-margin">부서 정보</span>
                                </v-col>
                                <v-col v-if="!isEdit">
                                    <v-btn color="primary" variant="tonal" @click="addItem">생성</v-btn>
                                    <v-btn color="primary" variant="tonal" :disabled="!selected" @click.stop = "editMode()">수정</v-btn>
                                    <v-btn class="mr-3" color="error" variant="tonal" @click.stop="deleteItem(selected)" :disabled="!selected">삭제</v-btn>
                                </v-col>
                                <v-col v-else>
                                    <v-btn color="primary" variant="tonal" @click="updateItem(selected)">저장</v-btn>
                                </v-col>

                            </v-row>
                            <v-row class="align-center justify-space-between" style="padding: 1rem 0; flex-wrap: nowrap; overflow-x: auto;">
                                <v-progress-circular
                                    v-if="isLoading"
                                    indeterminate
                                    color="primary"
                                    size="50"
                                    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
                                ></v-progress-circular>
                                <v-col style="min-width: 200px;">
                                    <span class="font-weight-black">상위 부서</span>
                                    <v-select
                                        v-if="isEdit"
                                        v-model="selected.upperDeptName"
                                        :items="departmentNames"
                                    ></v-select>
                                    <v-text-field v-else>{{ selected ? selected.upperDeptName : '' }}</v-text-field>
                                </v-col>
                                <v-col style="min-width: 200px;">
                                    <span class="font-weight-black">부서 코드</span>
                                    <v-text-field
                                        v-if="isEdit"
                                        v-model="selected.deptCode"
                                        :readonly="isEdit"
                                    ></v-text-field>
                                    
                                    <v-text-field v-else dense :value="selected ? selected.deptCode : ''"></v-text-field>
                                </v-col>
                                <v-col style="min-width: 200px;">
                                    <span class="font-weight-black">부서명</span>
                                    <v-text-field
                                        v-if="isEdit"
                                        v-model="selected.name"
                                        dense
                                        :rules="[v => !!v || '부서명은 필수입니다.']"
                                        @input="validateForm"
                                    ></v-text-field>
                                    <v-text-field v-else dense :value="selected ? selected.name : ''"></v-text-field>
                                </v-col>
                                <v-col style="min-width: 200px;">
                                    <span class="font-weight-black">영문 부서명</span>
                                    <v-text-field
                                        v-if="isEdit"
                                        v-model="selected.engName"
                                        dense
                                        :rules="[v => !!v || '영문 부서명은 필수입니다.']"
                                        @input="validateForm"
                                    ></v-text-field>
                                    <v-text-field v-else dense :value="selected ? selected.engName : ''"></v-text-field>
                                </v-col>
                                <v-col style="min-width: 200px;">
                                    <span class="font-weight-black">부서장</span>
                                    <v-select
                                        v-if="isEdit"
                                        v-model="selected.deptHead"
                                        :items="userNames"
                                    ></v-select>
                                    <v-text-field v-else dense :value="selected ? selected.deptHead : ''"></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                    </v-scroll-y-transition>
                </v-col>
            </v-row>
        </v-card>
    </div>

    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">'부서 생성'</v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                label="부서 코드"
                                v-model="department.deptCode"
                                dense
                                :rules="[v => !!v || '부서 코드는 필수입니다.']"
                                @input="validateForm"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                label="부서명"
                                v-model="department.deptName"
                                dense
                                :rules="[v => !!v || '부서명은 필수입니다.']"
                                @input="validateForm"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                label="영문 부서명"
                                v-model="department.engName"
                                dense
                                :rules="[v => !!v || '영문 부서명은 필수입니다.']"
                                @input="validateForm"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                v-model="department.deptHead"
                                :items="userNames"
                                label="부서장"
                            ></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                v-model="department.upperDeptName"
                                :items="departmentNames"
                                label="상위 부서명"
                            ></v-select>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" variant="plain" flat style="font-size: 15px; font-weight: 600;" @click="saveDepartment()">
                    저장
                </v-btn>
                <v-btn color="close" flat style="font-size: 15px; font-weight: 600;" @click="dialog = false">닫기</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ConfirmDialogs :dialog.sync="showConfirmDialog" @agree="confirmDelete" @disagree="showConfirmDialog = false" />

</template>

<script>
import { VTreeview } from 'vuetify/labs/VTreeview';
import api from '@/api/axiosinterceptor';
import FilterCard from '@/components/customer/FilterCard.vue';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import { useAlert } from '@/utils/useAlert';
import AlertComponent from '@/components/shared/AlertComponent.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

export default {
    components: {
        VTreeview,
        FilterCard,
        ConfirmDialogs,
        AlertComponent,
        BaseBreadcrumb 
    },

    data: () => ({
        active: [],
        open: [],
        departments: [],
        departmentNames: [],
        userNames: [],
        isLoading: false,
        dialog: false,
        formValid: false,
        isEdit: false,
        showConfirmDialog: false,
        department: {
            deptCode : '',
            deptName : '',
            engName : '',
            deptHead : '',
            upperDeptName : '',
        },
        page: {
            title: '부서 관리',
        },
        breadcrumbs: [
            {
                text: '관리자',
                disabled: false,
                href: '#'
            },
            {
                text: '부서 관리',
                disabled: true,
                href: '#'
            }
        ],
    }),

    computed: {
        items() {
            return [
                {
                    name: '부서',
                    children: this.departments,
                },
            ];
        },
        selected() {
            if (!this.active.length) return undefined;

            const id = this.active[0];
            this.isLoading = true;
            this.isEdit = false;
            const findDepartment = (departments) => {
                for (const department of departments) {
                    if (department.no === id) {
                        return department;
                    }
                
                    if (department.children && department.children.length) {
                        const foundInChildren = findDepartment(department.children);
                        if (foundInChildren) {
                            return foundInChildren;
                        }
                    }
                }
                return undefined;
            };
        
            const department = findDepartment(this.departments);

            setTimeout(() => {
                this.isLoading = false;
            }, 500);

            return department;
        },
    },

    methods: {
        async fetchusers() {
            try {
                const response = await api.get('/users');
                const userNames = response.data.result.map(user => user.userName);
                this.userNames = userNames;
            } catch(error) {
                console.error("유저 목록을 가져오는 중 오류 발생:", error);
            }
        },

        treeDepartments(departments) {
            const names = [];
            departments.forEach(department => {
                names.push(department.name);
                if (department.children && department.children.length > 0) {
                    names.push(...this.treeDepartments(department.children));
                }
            });
            return names;
        },

        async fetchDepartments() {
            try {
                this.isLoading = true;
                const response = await api.get('/admin/departments');
                const departments = response.data.result;
            
                if (departments && Array.isArray(departments)) {
                    this.departments = departments.map(department => ({
                        no: department.no,
                        name: department.name,
                        children: department.children || [],
                        deptCode: department.deptCode,
                        engName: department.engName,
                        deptHead: department.deptHead,
                        upperDeptName: department.upperDeptName
                    }));
                    this.departmentNames = this.treeDepartments(departments);
                } else {
                    console.warn("부서 데이터가 유효하지 않습니다:", response.data.result);
                }
            } catch (error) {
                console.error("부서 목록을 가져오는 중 오류 발생:", error);
            } finally {
                this.isLoading = false;
            }
        },

        clearForm() {
            this.department = {
                deptCode: '',
                deptName: '',
                engName: '',
                deptHead: '',
                upperDeptName: '',
            };
            this.active = [];
        },

        validateForm() {
            this.formValid = !!this.department.deptCode && !!this.department.deptName && !!this.department.engName;
        },
        
        async confirmDelete() {
            try {
                const apiUrl = `/admin/departments/${this.selected.no}`;
                const response = await api.delete(apiUrl);
                console.log('Delete successful:', response.data);
                this.triggerAlert('부서가 삭제되었습니다.', 'success', 2000);

                this.clearForm();
                await this.fetchDepartments();
            } catch (error) {
                console.error('Error deleting item:', error.message || error);
            } finally {
                this.showConfirmDialog = false;
            }
        },

        async saveDepartment() {
            try {
                const response = await api.post('/admin/departments', this.department);
                console.log('부서 저장 성공:', response.data);
                this.triggerAlert('부서를 등록하였습니다.', 'success', 2000);

                this.clearForm();
                this.dialog = false;

                await this.fetchDepartments();
            } catch (error) {
                console.error('부서 저장 중 오류 발생:', error);
                this.triggerAlert('부서 삭제에 실패했습니다.', 'error', 2000);
            }
        },

        async updateDepartment() {
            try {
                if (!this.selected || !this.selected.no) {
                    console.error('수정할 부서가 선택되지 않았습니다.');
                    return;
                }

                const apiUrl = `/admin/departments/${this.selected.no}`;
                const response = await api.patch(apiUrl, this.department);
                this.isEdit = false;
                console.log('부서 업데이트 성공:', response.data);
                this.triggerAlert('부서 정보를 수정하였습니다.', 'success', 2000);


                await this.fetchDepartments();
            } catch (error) {
                console.error('부서 업데이트 중 오류 발생:', error);
            }
        },

        updateItem(item) {
            if (!item) return;
            this.department = { 
                deptCode: item.deptCode,
                deptName: item.name,
                engName: item.engName,
                deptHead: item.deptHead,
                upperDeptName: item.upperDeptName,
            };
            
            console.log("상위부서 : ", this.department.upperDeptName, "타입: ", typeof this.department.upperDeptName);

            this.updateDepartment();
        },

        deleteItem(item) {
            this.selectedItem = item;
            this.showConfirmDialog = true;
        },

        addItem() {
            this.isEdit = false;
            this.clearForm();
            this.dialog = true;
        },

        editMode(){
            this.isEdit = true;
        }
    },
    
    setup() {
        const { alertMessage, alertType, showAlert, triggerAlert } = useAlert();
        return { alertMessage, alertType, showAlert, triggerAlert };
    },

    mounted() {
        this.fetchDepartments();
        this.fetchusers();
    }
};
</script>


<style scoped>
.v-btn {
    margin-top: 0.55rem;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
}
.custom-margin {
    margin-left: 10px;
}
.custom-card-title {
    background-color: rgb(220, 236, 250);
    color: #333;
    padding: 16px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
.v-card {
    margin-top: 1rem;
}

.filter_container {
    background-color: white;
    margin-right: 30px;
    width: 25%;
}
.customer_container {
    background-color: white;
    width: 80%;
}

.v-alert{
    margin-top: 0.5rem
}
</style>
