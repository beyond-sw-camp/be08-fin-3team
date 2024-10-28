<template>
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
                            <v-card>
                                <v-row class="text-right">
                                    <v-col class="text-sm-left">
                                        <span class="font-weight-black custom-margin">부서 정보</span>
                                    </v-col>
                                    <v-col>
                                        <v-btn color="primary" variant="tonal" @click="addItem" :disabled="selected">생성</v-btn>
                                        <v-btn color="primary" variant="tonal" @click="updateItem(selected)" :disabled="!selected">수정</v-btn>
                                        <v-btn class="mr-3" color="error" variant="tonal" @click.stop="deleteItem(selected)" :disabled="!selected">삭제</v-btn>
                                    </v-col>
                                </v-row>
                                <v-card-text>
                                    <v-col>
                                        <v-row class="align-center">
                                            <v-col cols="4">
                                                <span class="font-weight-black">상위 부서</span>
                                                <v-text-field dense :value="selected ? selected.upperDeptName : ''"></v-text-field>
                                            </v-col>
                                            <v-col cols="4">
                                                <span class="font-weight-black">부서 코드</span>
                                                <v-text-field dense :value="selected ? selected.deptCode : ''"></v-text-field>
                                            </v-col>
                                            <v-col cols="4">
                                                <span class="font-weight-black">부서명</span>
                                                <v-text-field dense :value="selected ? selected.name : ''"></v-text-field>
                                            </v-col>
                                        </v-row>
                                        <v-row class="align-center">
                                            <v-col cols="4">
                                                <span class="font-weight-black">영문 부서명</span>
                                                <v-text-field dense :value="selected ? selected.engName : ''"></v-text-field>
                                            </v-col>
                                            <v-col cols="4">
                                                <span class="font-weight-black">부서장</span>
                                                <v-text-field dense :value="selected ? selected.deptHead : ''"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-scroll-y-transition>
                </v-col>
            </v-row>
        </v-card>
    </div>

    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title class="text-h5">{{ isEdit ? '부서 정보 수정' : '부서 생성' }}</v-card-title>
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
                <v-btn color="primary" variant="plain" flat style="font-size: 15px; font-weight: 600;" :disabled="!formValid" @click="isEdit ? updateDepartment() : saveDepartment()">
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

export default {
    components: {
        VTreeview,
        FilterCard,
        ConfirmDialogs,
    },

    data: () => ({
        active: [],
        open: [],
        departments: [],
        departmentNames: [],
        userNames: [],
        // dialogDelete: false,
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

            return findDepartment(this.departments);
        },
    },

    methods: {
        async fetchusers(){
            try{
                const response = await api.get('/users');
                const userNames = response.data.result.map(user => user.userName);
                this.userNames = userNames;
            } catch(error){
                console.error("유저 목록을 가져오는 중 오류 발생:", error);
            }
        },
        async fetchDepartments() {
            try {
                const response = await api.get('/admin/departments');
                const departments = response.data.result;
                const departmentNames = response.data.result.map(department => department.name);
                this.departmentNames = departmentNames;

                if (departments) {
                    this.departments = departments.map(department => ({
                        no: department.no,
                        name: department.name,
                        children: department.children || [],
                        deptCode: department.deptCode,
                        engName: department.engName,
                        deptHead: department.deptHead,
                        upperDeptName: department.upperDeptName
                    }));
                }
            } catch (error) {
                console.error("부서 목록을 가져오는 중 오류 발생:", error);
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
                // this.dialogDelete = false;
                const apiUrl = `/admin/departments/${this.selected.no}`;
                const response = await api.delete(apiUrl);
                console.log('Delete successful:', response.data);

                this.clearForm();
                await this.fetchDepartments();
            } catch (error) {
                console.error('Error deleting item:', error.message || error);
            }finally{
                this.showConfirmDialog = false;
            }
        },

        async saveDepartment() {
            try {
                const response = await api.post('/admin/departments', this.department);
                console.log('부서 저장 성공:', response.data);

                this.clearForm();
                this.dialog = false;

                await this.fetchDepartments();
            } catch (error) {
                console.error('부서 저장 중 오류 발생:', error);
            }
        },

        async updateDepartment() {
            try {
                if (!this.selected || !this.selected.no) {
                    console.error('수정할 부서가 선택되지 않았습니다.');
                    return;
                }

                console.log("수정할 데이터:", this.department);
                this.dialog = false;

                const apiUrl = `/admin/departments/${this.selected.no}`;
                const response = await api.patch(apiUrl, this.department);
                console.log('부서 업데이트 성공:', response.data);

                this.clearForm();
                await this.fetchDepartments();
            } catch (error) {
                console.error('부서 업데이트 중 오류 발생:', error);
            }
        },

        updateItem(item) {
            if (!item) return;
            console.log('Selected item for update:', item);
            this.isEdit = true;
            this.department = { 
                deptCode: item.deptCode,
                deptName: item.name,
                engName: item.engName,
                deptHead: item.deptHead,
                upperDeptName: item.upperDeptName,
            };
            this.dialog = true;
        },

        deleteItem(item) {
            this.selectedItem = item;
            // this.dialogDelete = true;
            this.showConfirmDialog = true;
        },

        addItem(){
            this.isEdit = false;
            this.clearForm();
            this.dialog = true;
        },

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
    margin-right: 0.2rem;
    margin-left: 0.2rem;
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
