import HTTP from './../http'

export const upload = formData => HTTP.post('/upload/chunk', formData)

export const mergeFile = id => HTTP.post(`/mergeFile/${id}`)

export const createUploadTask = data => HTTP.post('/upload/task', data)