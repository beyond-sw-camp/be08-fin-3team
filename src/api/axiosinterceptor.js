import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Axios 인스턴스 생성
const api = axios.create({
//  baseURL: 'http://localhost:8080/api',
 // baseURL: 'http://15.164.92.171:8080/api',
 baseURL: 'http://api.salesboost.store/api',
  withCredentials: true, // 쿠키를 포함하여 서버에 요청 보냄
});

// Axios 요청 인터셉터 설정
api.interceptors.request.use(
  (config)=>{
    const accessToken = localStorage.getItem("accessToken");
    if(accessToken){
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error)=>{
    return Promise.reject(error);
  }
)

// Axios 응답 인터셉터 설정
api.interceptors.response.use(
  response => {
    return response; 
  },
  async error => {
    console.log('interceptor 실행')
    const originalRequest = error.config;
    const data = error.response.data;
     // _retry 속성이 없으면 false로 초기화
     if (!originalRequest._retry) {
        originalRequest._retry = false;
      }

    if(error.response && error.response.status === 401 && !originalRequest._retry){
        originalRequest._retry = true;
        console.log(data)
      
        if(data.code===425){ 
            try {
                // Access Token 재발급 요청 
                const res = await axios.post('http://localhost:8080/api/users/reissue', null, {
                  withCredentials: true,
                });
        
                const body = res.data;
                console.log(body);
                
                if(body.code==200){
                    const newAccessToken = res.data.result;
                    localStorage.setItem('accessToken', newAccessToken);
                      
                    // 원래의 요청에 새로운 Access Token을 넣어서 재시도
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }
                else{
                  authStore.logout();
                }
              } catch (reissueError) {
                // Refresh Token이 만료되었거나 오류가 발생한 경우
                console.error('Token reissue failed:', reissueError);
                authStore.logout();
              }
    
        }else if(data.code==426){ // 유효하지 않은 access token
            alert("세션이 만료되었습니다.");
            authStore.logout();
        }else{
            authStore.logout();
        }
    }
    else{
            alert("세션이 만료되었습니다.");
            authStore.logout();
    }

    return Promise.reject(error); 
  }
);

export default api;
