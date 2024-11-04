<script setup>
import api from '@/api/axiosinterceptor';
import { ref } from 'vue';

const props = defineProps({
    email:String,
    dept:String,
    joinDate:String,
    employeeId:String,
    name:String

})


const selectedFile =ref() // 선택한 파일

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.includes('image')) {
    selectedFile.value = file;
  } else {
    alert('이미지 파일만 선택가능합니다');
    selectedFile.value = null;
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
    if(response.data.code==200){
        console.log(response.data.result);

        localStorage.setItem("profileUrl","");
    }
    
    // uploadMessage.value = 'Image uploaded successfully!';
    // uploadedImageUrl.value = response.data.imageUrl; // 서버에서 이미지 URL을 반환한다고 가정

    // todo : localstorage 값 update
  } catch (error) {
    uploadMessage.value = 'Image upload failed.';
    console.error(error);
  }
};

</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined" class="bg-surface">
                <v-card-item>
                    <div class="d-flex gap-3 mb-5">
                        <BriefcaseIcon size="21" />
                        <span class="text-h6">부서 : {{ dept }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MailIcon size="21" />
                        <span class="text-h6">메일 : {{ email }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <DeviceDesktopIcon size="21" />
                        <span class="text-h6">사원번호 : {{ employeeId }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MapPinIcon size="21" />
                        <span class="text-h6">가입일 : {{ joinDate }}</span>
                    </div>
                    <!-- <div clss="d-flex gap-3 mb-5">
                        <v-btn @click="uploadImage" block color="secondary" variant="flat">사진 변경</v-btn>
                        <input type="file" @change="onFileChange" accept="image/*">
                    </div> -->

                    <div>
        <v-file-input
          v-model="selectedFile"
          placeholder="이미지 선택"
          label="이미지 업로드"
          multiple
          variant="outlined"
          hide-details="auto"
          prepend-icon="mdi-paperclip"
          @change="onFileChange"
        >
          <template v-slot:selection="{ fileNames }">
            <template v-for="fileName in fileNames" :key="fileName">
              <v-chip size="small" label color="primary" class="mr-2">
                {{ fileName }}
              </v-chip>
            </template>
          </template>
        </v-file-input>
        <v-btn @click="uploadImage" block color="secondary" variant="flat">사진 변경</v-btn>
        </div>
                    
                    </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
