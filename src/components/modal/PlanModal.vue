<template>
	<v-dialog :model-value="AddPlanModal" @update:model-value="$emit('update:AddPlanModal', $event)" persistent max-width="500px">
		<v-card>
			<v-card-title>일정</v-card-title>
			<v-card-text>
				<v-form @submit.prevent="submitPlan" lazy-validation>
					<div>
						<v-alert v-if="showAlert" type="warning" variant="tonal" class="warn-alert">
							<h5 class="text-h5 text-capitalize">warning</h5>
							<div>{{ alertMessage }}</div>
						</v-alert>
					</div>
					<v-row>
						<v-col cols="12" sm="6" md="6">
							<v-text-field v-model="plan.title" label="제목*" 
							:rules="[v => !!v || '일정명을 입력하세요.']" required></v-text-field>
						</v-col>
						<v-col cols="12" sm="6" md="6">
							<v-select
								v-model="plan.planCls"
								:items="planClsOptions"
								label="분류*" outlined
								@update:model-value ="fetchDomainDetails"
								:rules="[v => !!v || '분류를 선택하세요.']"
								required
							></v-select>
						</v-col>
						<v-col cols="12" v-if="plan.planCls && !['개인', '전사'].includes(this.plan.planCls)">
							<v-text-field 
								v-model="planDetails.title" 
								:label="dynamicTitleLabel" 
								readonly
							></v-text-field>
							<v-text-field 
								v-model="planDetails.note" 
								:label="dynamicNoteLabel" 
								readonly
							></v-text-field>
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="plan.planDate" label="일자*" type="date" 
							:rules="[v => !!v || '일자를 입력하세요.']" required></v-text-field>
						</v-col>
							<v-col cols="12" sm="6" md="6">
								<v-select
									label="시작 시간"
									v-model="plan.startTime"
									:items="timeOptions"
									outlined
									:rules="[v => !!v || '시작 시간을 선택하세요.']"
									required
								></v-select>
							</v-col>
							<v-col cols="12" sm="6" md="6">
								<v-select
									label="종료 시간"
									v-model="plan.endTime"
									:items="timeOptions"
									outlined
									:rules="[v => !!v || '종료 시간을 선택하세요.']"
									required
								></v-select>
							</v-col>
						<v-col cols="12">
							<v-switch color="primary" v-model="isPersonal" label="나만보기 여부"></v-switch>
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="plan.content" label="내용"></v-text-field>
						</v-col>
					</v-row>
					<small>*필수 입력</small>
				</v-form>
			</v-card-text>
			<ConfirmDialogs :dialog="showConfirmDialogs" @agree="confirmDelete" @disagree="cancleDelete" />
			<v-card-actions>
					<v-btn v-if="mode === 'edit'" color="primary" variant="outlined" @click="updatePlan" flat style="font-size: 15px; font-weight: 600;">수정</v-btn>
					<v-btn v-if="mode === 'edit'" color="error" variant="outlined" @click="deletePlan" flat style="font-size: 15px; font-weight: 600;">삭제</v-btn>
				<v-spacer></v-spacer>
					<v-btn v-if="mode === 'add'" color="primary"@click="addTodo" flat style="font-size: 15px; font-weight: 600;">저장</v-btn>
					<v-btn color="close" @click="closeModal" style="font-size: 15px; font-weight: 600;">닫기</v-btn>

					<ConfirmDialogs :dialog="showConfirmDialogs" @agree="confirmDelete" @disagree="cancleDelete" />
			</v-card-actions>
		</v-card>
		
		<v-dialog v-model="isSelected" max-width="450px">
			<v-card>
				<v-card-title class="headline">{{ dynamicCardTitle}}</v-card-title>
				<v-card-text>
					<perfect-scrollbar style="max-height: 300px">
					<v-list>
						<v-list-item
							v-for="(item, index) in domainList"
							:key="index"
							@click="selectDomain(item)"
							class="list-item-spacing"
						>
							<v-list-item-content>
								
								<v-list-item-title class="list-item-title"><v-icon small class="mr-2">mdi-check</v-icon>{{ item[titleField] }}</v-list-item-title>
								<v-list-item-subtitle class="note-text">{{ item[noteField] }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>
					</v-list>
				</perfect-scrollbar>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="isSelected = false">닫기</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-dialog>
</template>

<script>
import '@/views/apps/calendar/calendar.css';
import api from '@/api/axiosinterceptor';
import ConfirmDialogs from '../shared/ConfirmDialogs.vue';
import {planClsMapping, categoryColors} from '@/utils/PlanMappings'

export default {
	components: {
		ConfirmDialogs,
	},
	props: {
		AddPlanModal: Boolean,
		plan: Object,
		statusOptions: Array,
		planClsOptions: Array,
		mode: {
			type: String,
			default: 'add',
		},
	},
	computed: {
		dynamicCardTitle() {
			if (!this.plan.planCls) return '';
			return `${this.plan.planCls} 목록`;
		},
		dynamicTitleLabel() {
			if (!this.plan.planCls) return '관련 도메인';
			return `관련 ${this.plan.planCls} `;
		},
		dynamicNoteLabel() {
			if (!this.plan.planCls) return '내용';
			return `${this.plan.planCls} 내용`;
		},
	},

	data() {
		return {
			showAlert: false,
			showConfirmDialogs: false,
			isSelected: false,
			domainList: [],
			titleField: 'name',
			noteField: 'note',
			timeOptions: this.generateTimeOptions(), 
			planClsOptions: ['개인', '전사', '제안', '견적', '매출', '계약'],
			planCls: '',
			isPersonal: this.plan.personalYn === 'Y',
			planDetails: {
				title: '',
				note: '',
			},
			categoryColors: {
				personal_plan: { color: '#f7eaa4', label: '개인 일정' },
				company_plan: { color: '#e5eaac', label: '전사 일정' },
				proposal_plan: { color: '#9ed7a9', label: '제안' },
				contract_plan: { color: '#a4cbe8', label: '계약' },
				sales_plan: { color: '#a4bbe1', label: '매출' },
				estimate_plan: { color: '#ccd5db', label: '견적' }
			}
		};
	},
	watch: {
		isPersonal(newValue) {
			this.plan.personalYn = newValue ? 'Y' : 'N';
		},
		'plan.personalYn': {
			handler(newValue) {
				this.isPersonal = newValue === 'Y';
			},
			immediate: true,
		},
	},
	methods: {
		validatePlan(){
			if (!this.plan.title || !this.plan.planCls || !this.plan.planDate || !this.plan.startTime || !this.plan.endTime) {
				this.showAlert = true;
				this.alertMessage = '필수 필드를 입력해주세요'
				setTimeout(() => {
					this.showAlert = false;
				}, 2000);
        return false;
			}
			return true;
		},
		async fetchDomainDetails() {
		const planCls = this.plan.planCls;
		console.log(planCls, 'planCls');
			let apiUrl = '';
			let titleField = '';
			let noteField = '';
			switch (planCls) {
				case '매출':
					apiUrl = `sales`;
					this.titleField = 'busiTypeDetail';
					noteField = 'note';
					break;
				case '제안':
					apiUrl = `proposals`;
					this.titleField = 'name';
					noteField = 'cont';
					break;
				case '견적':
					apiUrl = `estimates`;
					this.titleField = 'name';
					noteField = 'note';
					break;
				case '계약':
					apiUrl = `contract`;
					this.titleField = 'name';
					noteField = 'note';
					break;
				default:
					this.domainList = [];
					return;
			}

			try {
				const response = await api.get(apiUrl);
				console.log(response.data)

				if (planCls === '제안') {
					this.domainList = response.data;
				} else {
					this.domainList = response.data.result;
				}
				this.isSelected = true;
			} catch (error) {
				console.error(error);
				this.domainList = [];
			}
		},
		selectDomain(item) {
			this.planDetails = {
				title: item[this.titleField] || '',
				note: item[this.noteField] || '',
			};	
			this.isSelected = false;
			this.domainList = [];
		},
		generateTimeOptions() {
			const options = [];
			for (let hour = 0; hour < 24; hour++) {
				for (let minute = 0; minute < 60; minute += 30) {
					const paddedHour = hour.toString().padStart(2, '0');
					const paddedMinute = minute.toString().padStart(2, '0');
					options.push(`${paddedHour}:${paddedMinute}`);
				}
			}
			return options;
		},
		submitPlan() {
			if(!this.validatePlan()){
				return;
			}
			this.showAlert = false;
			
			if (!this.plan.planCls || !planClsMapping[this.plan.planCls]) {
				return;
			}
			this.plan.planCls = planClsMapping[this.plan.planCls];
			const categoryColor = categoryColors[this.plan.planCls];
			this.plan.backgroundColor = categoryColor;

			this.$emit('show-alert', {
				message: '저장이 완료되었습니다.',
				type: 'success',
			});
			this.$emit('add', this.plan);
			this.closeModal();
			},

		async updatePlan() {
			if(!this.validatePlan()){
				return;
			}
			try {
				this.plan.planCls = planClsMapping[this.plan.planCls];
				const categoryColor = categoryColors[this.plan.planCls];
				this.plan.backgroundColor = categoryColor;
				const response = await api.patch(`/plans/${this.plan.planNo}`, this.plan);
				const updatedPlan = response.data.result;

				this.$emit('show-alert', {
					message: '수정이 완료되었습니다.',
					type: 'success',
				});
				this.$emit('update', updatedPlan);
				this.closeModal();
			} catch (error) {
				console.error(error);
			}
		},
		async deletePlan() {
			if (!this.plan.planNo) {
				return;
			}

			try {
				this.showConfirmDialogs = true;
			} catch (error) {
				console.error(e);
			}
		},
		confirmDelete(){
			this.showConfirmDialogs = false;
			this.$emit('delete', this.plan);
		},
		cancleDelete(){
			this.showConfirmDialogs = false;
		},

		closeModal() {
			this.planCls=null;
			this.$emit('close');
		},
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
	font-size: 16px;
}
.headline {
	padding-top: 20px;
	font-weight: bold;
}

.list-item-spacing {
	margin-bottom: 12px;
}

.list-item-title {
	font-size: 1em;
	font-weight: 500;
}

.note-text {
	font-size: 0.9rem;
	margin-left: 37px;
	color: #464646;
}

</style>