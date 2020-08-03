/* eslint-disable no-debugger */
import axios from 'axios'

const instance = axios.create({
    baseURL: '/api',
    responseType: 'json',
})

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    const { data } = response
    if (data?.status === 200) {
        return data.result
    }
    
    return Promise.reject(data.message)
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default instance