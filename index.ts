import { Axios } from 'axios';
import {
  LOCAL_ACCESS_KEY,
  LOCAL_REFRESH_KEY,
  BASE_URL,
  LOGIN_URL,
  TEST_URL,
  FETCH_TOKEN_URL,
} from './const';
import { AxiosRetry } from './retry';

const axios = new Axios({
  baseURL: 'http://localhost:8888',
});

axios.interceptors.request.use(config => {
  const url = config.url;
  if (url !== 'login') {
    config.headers.Authorization = localStorage.getItem(LOCAL_ACCESS_KEY);
  }
  return config;
});

axios.interceptors.response.use(res => {
  if (res.status !== 200) {
    return Promise.reject(res);
  }
  return JSON.parse(res.data);
});

const axiosRetry = new AxiosRetry({
  baseUrl: BASE_URL,
  url: FETCH_TOKEN_URL,
  unauthorizedCode: 401,
  getRefreshToken: () => localStorage.getItem(LOCAL_REFRESH_KEY),
  onSuccess: res => {
    const accessToken = JSON.parse(res.data).accessToken;
    localStorage.setItem(LOCAL_ACCESS_KEY, accessToken);
  },
  onError: () => {
    console.log('refreshToken 过期了，乖乖去登录页');
  },
});

const get = (url, options?) => {
  return axiosRetry.requestWrapper(() => axios.get(url, options));
};

const post = (url, options?) => {
  return axiosRetry.requestWrapper(() => axios.post(url, options));
};

const login = (): any => {
  return post(LOGIN_URL);
};
const test = (): any => {
  return get(TEST_URL);
};

// 模拟页面函数
const doing = async () => {
  // 模拟登录
  const loginRes = await login();
  localStorage.setItem(LOCAL_ACCESS_KEY, loginRes.accessToken);
  localStorage.setItem(LOCAL_REFRESH_KEY, loginRes.refreshToken);

  // 模拟10s内请求
  test().then(res => console.log(`${res.name}-1`));
  test().then(res => console.log(`${res.name}-2`));

  // 模拟10s后请求，accessToken失效
  setTimeout(() => {
    test().then(res => console.log(`${res.name}-3`));
    test().then(res => console.log(`${res.name}-4`));
  }, 10000);

  // 模拟30s后请求，refreshToken失效
  setTimeout(() => {
    test().then(res => console.log(`${res.name}-5`));
    test().then(res => console.log(`${res.name}-6`));
  }, 30000);
};

// 执行函数
doing();