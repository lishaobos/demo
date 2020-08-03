<template>
  <div id="app">
    <input type="file" multiple @change="uploads" />
    <button @click="mkFile">合并</button>
  </div>
</template>

<script>
/* eslint-disable */
import { createUploadTask, upload, mergeFile } from "./apis/common"
import { compose, asyncCompose, curry } from './assets/js'

const useFileUtils = () => {

    const sliceFile = (tasks, file) => tasks.map( task => {
        return {
            id: task.id,
            index: task.index,
            name: task.name,
            type: task.type,
            file: file.slice(task.start, task.fileSize + task.start)
        }
    } )

    const limitSendRequest = (request, limit, list) => {
        return new Promise( (resolve) => {
            let index = 0
            let count = 0
            const len = list.length
            
            const sendRequest = async info => {
                try {
                    await request(info)
                    if (index >= len - 1) return resolve()
                    
                    count--
                    start()
                } catch(e) {
                    sendRequest(info)
                    throw e
                }
            }

            const start = () => {
                while (index < len) {
                    if (count >= limit)  return

                    const info = list[index]
                    count++
                    index++
                    sendRequest(info)
                }
            }

            start()
        })
    }


    const createFormData = tasks => {
        const arr = []
        
        for (const [index, item] of tasks.entries()) {
            const formData = new FormData()
            formData.append("id", item.id)
            formData.append("index", item.index)
            formData.append("file", item.file)
            formData.append("name", item.name)
            formData.append("type", item.type)
            arr.push(formData)
        }

        return arr
    }
    

    const createTask = async (file, chunkSize) => {
        const { name: fileName, size: fileSize } = file
        const lastIndex = fileName.indexOf('.')
        const name = fileName.slice(0, lastIndex)
        const type = fileName.slice(lastIndex + 1)

        const res = await createUploadTask({
            name,
            type,
            chunkSize,
            fileSize
        })

        return res
    }

    const uploadFile = async (file, request, limit, taskInfo) => {
        const _uploads = compose(
            curry(sliceFile)(taskInfo.children),
            createFormData,
            curry(limitSendRequest)(request, limit)
        )
            
        await _uploads(file)
    }

    const uploadTask = async file => {
        const chunkSize =  1024 * 1024 * 4
        const requestLimit = 4

        console.log('开始上传')
        const taskInfo = await createTask(file, chunkSize)
        await uploadFile(file, upload, requestLimit, taskInfo)
        console.log('开始整合')
        await mergeFile(taskInfo.id)
        console.log('合成完毕')
    }

    return {
        createFormData,
        sliceFile,
        limitSendRequest,
        uploadTask
    }
}

const mkFile = () => {
    mergeFile(79)
}

export default {
  name: "App",
  setup() {
      
    const { uploadTask } = useFileUtils()
    
    const uploads = async event => {
        const files = Array.from(event.target.files)
        
        for (const file of files) {
            uploadTask(file)
        }
    }

    return {
      uploads,
      mkFile
    }
  }
}
</script>

<style>
</style>
