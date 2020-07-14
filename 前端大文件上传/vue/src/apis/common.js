import HTTP from './../http'

export const upload = blob => HTTP.post('/upload', blob)

export const mergeFile = () => HTTP.post('/mergeFile')