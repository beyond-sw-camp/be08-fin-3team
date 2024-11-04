<template>
    <div>
      <v-alert v-if="showSuccessAlert" type="success" variant="tonal" class="alert">
        <h5 class="text-h6 text-capitalize">Success</h5>
        <div>{{ alertMessage }}</div>
      </v-alert>
      <v-alert v-else-if="showAlert" type="warning" variant="tonal" class="alert">
        <h5 class="text-h6 text-capitalize">Warning</h5>
        <div>{{ alertMessage }}</div>
      </v-alert>
    </div>
    <v-row justify="end">
      <v-col cols="12" lg="12" offset-md="1">
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">

          <div class="mb-4">
            <v-label class="custom-label">영업기회</v-label>
            <v-btn v-if="!isEditMode" @click="showLeadsModal = true" class="cus-btn">
              <v-icon small>mdi-plus</v-icon>영업기회 가져오기
            </v-btn>

            <v-text-field class="mt-4"
              v-model="act.leadName"
              label="관련 영업기회"
              outlined
              readonly
              :disabled="isEditMode"
            ></v-text-field>
          </div>
          <v-dialog v-model="showLeadsModal" max-width="800">
          <v-card>
            <v-card-title class="headline">영업기회 목록</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="10">
                  <v-text-field label="검색" v-model="searchQuery" clearable></v-text-field>
                </v-col>
                <v-col cols="2">
                  <v-btn @click="fetchLeads" color="primary">검색</v-btn>
                </v-col>
              </v-row>
              <v-data-table
                :headers="leadHeaders"
                :items="filteredLeads"
                item-value="leadNo"
                class="border rounded-md"
                items-per-page="5"
              >
                <template v-slot:item="{ item }">
                  <tr
                    :class="{ 'highlighted-row': selectedLead && selectedLead.leadNo === item.leadNo }"
                    @click="handleRowClick(item)"
                    @dblclick="selectLead(item)"
                  >
                <td>{{ item.leadNo }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.note }}</td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="selectLead(selectedLead)">선택</v-btn>
              <v-btn color="error" @click="showLeadsModal = false">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

            <v-label class="custom-label">활동명<span class="require">*</span></v-label>
            <v-text-field
              v-model="act.name"
              outlined
              :rules="[v => !!v || '활동명을 입력하세요.']"
              required
            ></v-text-field>

            <v-label class="custom-label">활동분류<span class="require">*</span></v-label>
            <v-select
              v-model="act.cls"
              :items="actStatusOptions"
              outlined
              :rules="[v => !!v || '활동분류를 선택하세요.']"
              required
            ></v-select>

            <v-label class="custom-label">활동목적<span class="require">*</span></v-label>
            <v-text-field
              v-model="act.purpose"
              outlined
              :rules="[v => !!v || '활동목적을 입력하세요.']"
              required
            ></v-text-field>

            <v-label class="custom-label">활동일자<span class="require">*</span></v-label>
            <v-text-field
              v-model="act.actDate"
              type="date"
              :rules="[v => !!v || '활동일자를 선택하세요.']"
              outlined
              required
            ></v-text-field>

            <v-row>
              <v-col>
                <v-label class="custom-label">시작 시간<span class="require">*</span></v-label>
                <v-select 
                  v-model="act.startTime" 
                  :items="timeOptions"
                  required
                  :rules="[v => !!v || '시작 시간을 선택하세요.']"
                  outlined
                ></v-select>
              </v-col>
              <v-col>
                <v-label class="custom-label">종료 시간<span class="require">*</span></v-label>
                <v-select 
                  v-model="act.endTime" 
                  :items="timeOptions"
                  required
                  :rules="[v => !!v || '종료 시간을 선택하세요.']"
                  outlined
                ></v-select>
              </v-col>
            </v-row>

            <v-col cols="12" md="3" sm="6">
              <v-label class="custom-label">완료 여부</v-label>
                <v-switch v-model="isComplete" hide-details color="primary" inset></v-switch>
            </v-col>
            <ConfirmDialogs :dialog="showConfirmDialogs" @update:dialog="(val) => showConfirmDialogs = val" @agree="confirmDelete" @disagree="cancleDelete" />
            <v-textarea label="계획내용" v-model="act.planContent" outlined></v-textarea>
            <v-textarea label="활동내용" v-model="act.actContent" outlined></v-textarea>

            <v-btn v-if="isEditMode" class="mr-2" color="primary" @click="updateAct" variant="flat">수정</v-btn>
            <v-btn v-else-if="!isEditMode" :loading="loading" color="primary" type="submit">저장</v-btn>
            <v-btn v-if="isEditMode" color="error" variant="flat" @click="deleteAct" flat>삭제</v-btn>
            <v-btn class="ml-2" variant="outlined" color="primary" @click="goToList">목록으로 돌아가기</v-btn>
          </v-form>            

      </v-col>
    </v-row>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/axiosinterceptor';
import { actStatus } from '@/utils/ActStatusMappings';
import ConfirmDialogs from '@/components/shared/ConfirmDialogs.vue';
import './Act.css'

export default {
	components: {
		ConfirmDialogs,
	},
  props: {
    cls: {
      type: String,
      default: ''
    }
  },
  setup(props,{ emit }) {
    const router = useRouter();
    const route = useRoute();
    const valid = ref(false);
    const form = ref(null);
    const loading = ref(false);
    const showConfirmDialogs = ref(false);
    const showAlert = ref(false);
    const showSuccessAlert = ref(false);
    const alertMessage = ref('');
    const alertType = ref('');
    const showLeadsModal = ref(false);
    const leads = ref([]);
    const isEditMode = ref(false);
    const isComplete = ref(false);
    const act = ref({
      leadNo: '',
      calendarNo: '',
      name: '',
      cls: '',
      purpose: '',
      actDate: null,
      startTime: null,
      endTime: null,
      completeYn: false,
      planContent: '',
      actContent: ''
    });
    const searchQuery = ref('');
    const selectedLead = ref(null);

    const filteredLeads = computed(() => {
      if (!searchQuery.value) {
        return leads.value;
      }
      
      return leads.value.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          lead.note.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const leadHeaders = ref([
      { title: '번호', key: 'leadNo', width: '100px' },
      { title: '이름', key: 'name' },
      { title: '메모', key: 'note' }
    ]);
    
    onMounted(() => {
      const actNo = route.params.actNo; // actNo가 있으면 수정 모드로 간주
      isEditMode.value = !!actNo; // actNo가 있으면 true, 없으면 false
      console.log('isEditMode',isEditMode.value)
      getCalendarNo();
    });

    const getCalendarNo = async () => {
      try {
        const response = await api.get('/calendars/user/data');
        act.value.calendarNo = response.data.result.calendarNo;
      } catch (e) {
        console.error(e);
      }
    };

    const selectLead = (lead = selectedLead.value) => {
      console.log('act.lead',act.value)
      if (lead) {
        act.value.leadNo = lead.leadNo;
        act.value.leadName = lead.name;
        act.value.note = lead.note;
        showLeadsModal.value = false;
      }
    };

    const fetchLeads = async () => {
      try {
        const response = await api.get('/leads');
        if (response.data.code === 200) {
          console.log('response.data.result',response.data.result)
          leads.value = response.data.result.map((lead) => ({
            leadNo: lead.leadNo,
            name: lead.name,
            note: lead.note,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    onMounted(fetchLeads);

    const actNo = route.params.actNo;

    const fetchActDetails = async () => {
      try {
        const response = await api.get(`/acts/${actNo}`);
        if (response.data.code === 200) {
          const actData = response.data.result;
          act.value = { ...actData, cls: props.cls || actData.cls };
          isComplete.value = act.value.completeYn === 'Y';
        }
      } catch (error) {
        console.error(error);
      }
    };
    onMounted(fetchActDetails);

    const actStatusOptions = ref(Object.keys(actStatus));

    const handleRowClick = (item) => {
      selectedLead.value = item;
    };

    const handleRowDblClick = () => {
      if (selectedLead.value) {
        selectLead(showLeadsModal.value);
      }
    };

    const generateTimeOptions = () => {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const paddedHour = hour.toString().padStart(2, '0');
          const paddedMinute = minute.toString().padStart(2, '0');
          options.push(`${paddedHour}:${paddedMinute}`);
        }
      }
      return options;
    };

    const timeOptions = ref(generateTimeOptions());

    const submitForm = async () => {
      const isValid = form.value && await form.value.validate();
      if (isValid.valid) {
        loading.value = true;
        try {
          const response = await api.post('/acts', {
            leadNo: act.value.leadNo,
            name: act.value.name,
            cls: actStatus[act.value.cls],
            purpose: act.value.purpose,
            actDate: act.value.actDate,
            startTime: act.value.startTime,
            endTime: act.value.endTime,
            completeYn: act.value.completeYn ? "Y" : "N", 
            planContent: act.value.planContent,
            actContent: act.value.actContent,
            calendarNo: act.value.calendarNo,
          });

          if (response.data.code === 200 || response.data.code === 201) {
            alertMessage.value = '저장이 완료되었습니다.';
            alertType.value = 'success';
            showSuccessAlert.value = true;
            setTimeout(() => {
              showSuccessAlert.value = false;
              
              const returnTo = router.currentRoute.value.query.returnTo;
              
              if (returnTo) {
                router.push('/apps/act/list');
              } else {
                router.push('/apps/calendar');
              }
            }, 2000);
          }
        } catch (error) {
          console.error("등록 실패:", error);
        } finally {
          loading.value = false;
        }
      } 
      else {
        alertMessage.value = '필수 값을 입력해주세요.';
        alertType.value = 'warning';
        showAlert.value = true;
        setTimeout(() => {
          showAlert.value = false;
        }, 2000);
      }
    };
    
    const updateAct = async () => {
			try {
				const response = await api.patch(`/acts/${actNo}`, {
            leadNo: act.value.leadNo,
            name: act.value.name,
            cls: actStatus[act.value.cls],
            purpose: act.value.purpose,
            actDate: act.value.actDate,
            startTime: act.value.startTime,
            endTime: act.value.endTime,
            completeYn: act.value.completeYn, 
            planContent: act.value.planContent,
            actContent: act.value.actContent,
            calendarNo: act.value.calendarNo,
          });

				const updatedAct = response.data.result;

				emit('update', updatedAct);
        
        alertMessage.value = '수정이 완료되었습니다.';
        alertType.value = 'success';
        showSuccessAlert.value = true;
        setTimeout(() => {
          showAlert.value = false;
        router.push('/apps/act/list');
        }, 2000);
			} catch (e) {
				console.error(e);
			}
    };

    const goToList = () => {
      router.push('/apps/act/list');
    };

    const deleteAct = () => {
      showConfirmDialogs.value = true;
    };

    const confirmDelete = async () => {
      showConfirmDialogs.value = false;
      const actNo = route.params.actNo;
      try {
        await api.delete(`/acts/${actNo}`);
        alertMessage.value = '삭제가 완료되었습니다.';
        showSuccessAlert.value = true;
        setTimeout(() => {
          showSuccessAlert.value = false;
          router.push('/apps/act/list');
        }, 2000);
      } catch (e) {
        console.error(e);
        alertMessage.value = '삭제 실패!';
        showAlert.value = true;
        setTimeout(() => {
          showAlert.value = false;
        }, 2000);
      }
    };

    const cancleDelete = () => {
      showConfirmDialogs.value = false;
    };

    watch(isComplete, (newVal) => {
      act.value.completeYn = newVal ? 'Y' : 'N';
    });

    return {
      form,
      valid,
      act,
      actStatusOptions,
      timeOptions,
      loading,
      showAlert,
      showSuccessAlert,
      alertMessage,
      alertType,
      submitForm,
      leads,
      showLeadsModal,
      selectLead,
      goToList,
      isEditMode,
      isComplete,
      updateAct,
      deleteAct,
      confirmDelete,
      cancleDelete,
      showConfirmDialogs,
      handleRowClick,
      handleRowDblClick,
      filteredLeads,
      searchQuery,
      leadHeaders,
    };
  }
};
</script>

<style>

.hidden-field {
    visibility: hidden;
}

.headline {
    font-size: 18px;
    font-weight: bold;
}

.highlighted-row {
    background-color: #e0f7fa;
}
</style>