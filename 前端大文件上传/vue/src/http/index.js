import axios from 'axios'

const instance = axios.create({
    baseURL: '/api',
    responseType: 'json',
})

export default instance