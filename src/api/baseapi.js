import axios from "axios";


// Axios 인스턴스 생성
const baseApi = axios.create({
  //  baseURL: 'http://localhost:8080/api',
  baseURL: 'http://15.164.92.171:8080/api',
  });


export default baseApi;