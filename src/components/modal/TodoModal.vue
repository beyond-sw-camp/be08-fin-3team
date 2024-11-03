<template>
	<v-dialog :model-value="AddTodoModal" @update:model-value="$emit('update:AddTodoModal', $event)" persistent max-width="500px">
		<v-card>
			<v-card-title>할 일</v-card-title>
			<v-card-text>
				<v-form ref="form" @submit.prevent="addTodo" lazy-validation>
					<div>
						<v-alert v-if="showAlert" type="warning" variant="tonal" class="warn-alert">
							<h5 class="text-h5 text-capitalize">warning</h5>
							<div>{{ alertMessage }}</div>
						</v-alert>
					</div>
					<v-row>
						<v-col cols="12" sm="6" md="4">
							<v-text-field v-model="todo.title" label="제목*" :rules="[v => !!v || '일정명을 입력하세요.']" required></v-text-field>
						</v-col>
						<v-col cols="12" sm="6" md="4">
							<v-text-field v-model="todo.todoCls" label="분류*" :rules="[v => !!v || '분류를 입력하세요.']" required></v-text-field>
						</v-col>
						<v-col cols="12" sm="6" md="4">
							<v-select v-model="todo.priority" :items="priorityOptions" label="우선순위*" :rules="[v => !!v || '우선순위를 선택하세요.']" required></v-select>
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="todo.dueDate" label="마감일*" type="date" :rules="[v => !!v || '마감일을 입력하세요.']" required></v-text-field>
						</v-col>
						<v-col cols="12">
							<v-select v-model="todo.status" :items="statusOptions" label="상태*" :rules="[v => !!v || '상태를 선택하세요.']" required></v-select>
						</v-col>
						<v-col cols="12">
							<v-switch color="primary" v-model="isPrivate" label="나만보기 여부"></v-switch>
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="todo.content" label="내용"></v-text-field>
						</v-col>
					</v-row>
					<small>*필수 입력</small>
				</v-form>
			</v-card-text>
			<ConfirmDialogs :dialog="showConfirmDialogs" @agree="confirmDelete" @disagree="cancleDelete" />
			<v-card-actions>
				<v-btn v-if="mode === 'edit'" color="primary" variant="outlined" @click="updateTodo" flat style="font-size: 15px; font-weight: 600;">수정</v-btn>
				<v-btn v-if="mode === 'edit'" color="error" variant="outlined" @click="deleteTodo" flat style="font-size: 15px; font-weight: 600;">삭제</v-btn>
				<v-spacer></v-spacer>
				<v-btn v-if="mode === 'add'" color="primary"@click="addTodo" flat style="font-size: 15px; font-weight: 600;">저장</v-btn>
				<v-btn color="close" @click="closeModal" style="font-size: 15px; font-weight: 600;">닫기</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import '@/views/apps/calendar/calendar.css'
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import api from '@/api/axiosinterceptor';

export default {
	components: {
		ConfirmDialogs,
	},
	props: {
		AddTodoModal: Boolean,
		todo: Object,
		statusOptions: Array,
		priorityOptions: Array,
		mode: {
			type: String,
			default: 'add',
		},
	},
	data() {
		return {
      		priorityOptions: ['높음', '중간', '낮음'],
			showAlert: false,
			showSuccessAlert: false,
			showConfirmDialogs: false,
			alertMessage: '',
			alertType: '',
			isPrivate: this.todo.privateYn === 'Y',
			statusMapping: {
				"진행 전": "TODO",
				"진행 중": "INPROGRESS",
				"완료": "DONE",
				"TODO": "진행 전",
				"INPROGRESS": "진행 중",
				"DONE": "완료"
			},
		};
	},
	watch: {
		isPrivate(newValue) {
			this.todo.privateYn = newValue ? 'Y' : 'N';
		},
		'todo.privateYn': {
			handler(newValue) {
				this.isPrivate = newValue === 'Y';
			},
			immediate: true,
		},
	},
	
	methods: {
		mapStatusToEnum(status) {
			return this.statusMapping[status] || status;
		},
    validateTodo() {
			const isValid = this.$refs.form.validate();
      if (!this.todo.title || !this.todo.todoCls || !this.todo.priority || !this.todo.dueDate || !this.todo.status) {
        // this.showAlert = true;
        // this.alertMessage = '필수 필드를 입력해주세요';
        setTimeout(() => {
          this.showAlert = false;
        }, 2000);
        return false;
      }
			if(!isValid){
				return false;
			}
      return true;
    },

		addTodo() {
      if (!this.validateTodo()) {
        return;
			}else{
					this.$emit('show-alert', {
						message: '저장이 완료되었습니다.',
						type: 'success',
					});
					this.$emit('add');
			}
		},
		async updateTodo() {
			if (!this.validateTodo()) {
				return;
			}
			const todoData = {
				...this.todo,
				status: this.mapStatusToEnum(this.todo.status),
			};

			try {
				const response = await api.patch(`/todos/${this.todo.todoNo}`, todoData);
				const updatedTodo = response.data.result;

				this.$emit('update', updatedTodo);
				this.$emit('show-alert', {
					message: '수정이 완료되었습니다.',
					type: 'success',
				});
				this.closeModal();
			} catch (e) {
				console.error(e);
			}
		},
		deleteTodo(){
			this.showConfirmDialogs = true;
		},
		confirmDelete(){
			this.showConfirmDialogs = false;
			this.$emit('delete', this.todo);
		},
		cancleDelete(){
			this.showConfirmDialogs = false;
		},
		closeModal(){
				this.$emit('close');
		}
	},
};
</script>
<style scoped>

.warn-alert {
	position: fixed;
	bottom: 10%; 
	left: 50%;
	transform: translateX(-50%);
	z-index: 3000;
	width: 60%;
}
</style>