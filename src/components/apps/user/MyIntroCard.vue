<template>
  <v-row>
      <v-col cols="12">
          <v-card variant="outlined" class="bg-surface">
              <v-card-item>
                  <v-row class="align-center">
                      <!-- 왼쪽: 부서, 메일, 사원번호, 가입일 정보 -->
                      <v-col cols="12" md="6">
                          <div class="d-flex gap-3 mb-3 align-center">
                              <BriefcaseIcon size="21" />
                              <span class="text-h6">부서 : {{ dept }}</span>
                          </div>
                          <div class="d-flex gap-3 mb-3 align-center">
                              <MailIcon size="21" />
                              <span class="text-h6">메일 : {{ email }}</span>
                          </div>
                          <div class="d-flex gap-3 mb-3 align-center">
                              <DeviceDesktopIcon size="21" />
                              <span class="text-h6">사원번호 : {{ employeeId }}</span>
                          </div>
                          <div class="d-flex gap-3 mb-3 align-center">
                              <MapPinIcon size="21" />
                              <span class="text-h6">가입일 : {{ joinDate }}</span>
                          </div>
                      </v-col>

                      <!-- 오른쪽: 프로필 사진 미리보기 및 변경 -->
                      <v-col cols="12" md="4" class="text-center">
                          <!-- 이미지 미리보기 또는 기본 아이콘 -->
                          <v-img v-if="imagePreview" :src="imagePreview" class="profile-image mb-4" />
                          <v-avatar v-else size="120" color="grey-lighten-2" class="mb-4">
                              <v-icon color="grey">mdi-account</v-icon>
                          </v-avatar>

                          <!-- 파일 선택 및 업로드 버튼 -->
                          <v-file-input
                              v-model="selectedFile"
                              placeholder="이미지 선택"
                              label="프로필 사진"
                              variant="outlined"
                              prepend-icon="mdi-paperclip"
                              accept="image/*"
                              hide-details
                              @change="onFileChange"
                              dense
                          ></v-file-input>

                          <v-btn @click="uploadImage" color="secondary" variant="outlined" block class="mt-2">
                              프로필 사진 변경
                          </v-btn>
                      </v-col>
                  </v-row>
              </v-card-item>
          </v-card>
      </v-col>
  </v-row>
</template>

<script setup>
import api from '@/api/axiosinterceptor';
import { ref } from 'vue';
import { useProfileImageStore } from '@/stores/userInfo';

const store = useProfileImageStore();
const props = defineProps({
  email: String,
  dept: String,
  joinDate: String,
  employeeId: String,
  name: String,
});

const selectedFile = ref(null); // 선택한 파일
const imagePreview = ref(null); // 이미지 미리보기 URL

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.includes('image')) {
      selectedFile.value = file;
      imagePreview.value = URL.createObjectURL(file); // 이미지 미리보기 URL 생성
  } else {
      alert('이미지 파일만 선택 가능합니다');
      selectedFile.value = null;
      imagePreview.value = null;
  }
};

const uploadImage = async () => {
  if (!selectedFile.value) {
      alert('이미지를 선택해주세요');
      return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
      const response = await api.post('/users/upload', formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      console.log(response);
      if (response.data.code == 200) {
          localStorage.setItem("profileUrl", response.data.result);
          store.refreshImg();
          alert('프로필 사진이 성공적으로 업로드되었습니다.');
      }
  } catch (error) {
      alert('이미지 업로드 실패');
      console.error(error);
  }
};
</script>

<style scoped>
.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}
</style>

