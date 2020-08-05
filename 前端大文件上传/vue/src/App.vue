<template>
    <input ref="file" type="file" multiple @change="uploads" style="width: 0; height: 0" />
    <div class="header">
        the file upload
    </div>
    <div class="container">
        <ul class="nav">
            <li class="menu-item">uploading</li>
            <li class="menu-item">done</li>
        </ul>
        <ul class="content">
            <li class="task-control">
                <button @click="$refs.file.click()">开始</button>
                <button disabled>暂停</button>
            </li>
            <li class="task-header">
                <div class="column">名称</div>
                <div class="column">进度</div>
                <div class="column">速度</div>
            </li>
            <li class="task" v-for="(item, index) in uploadTasks" :key='index'>
                <div class="task-item task-name">{{ item.name }}</div>
                <div class="task-item task-process">
                    <div class="task-twig" :style="{ width: `${item.process}%` }"></div>
                </div>
                <div class="task-item task-speed">10Mb/s</div>
            </li>
        </ul>
    </div>
</template>

<script>
/* eslint-disable */
import { reactive, ref } from 'vue'
import { createUploadTask, upload, mergeFile } from "./apis/common"
import { compose, curry } from './assets/js'

const useFileUtils = () => {

    const uploadData = reactive({
        uploadTasks: []
    })

    const sliceFile = (tasks, file) => tasks.map( task => {
        return {
            id: task.id,
            index: task.index,
            name: task.name,
            type: task.type,
            file: file.slice(task.start, task.fileSize + task.start)
        }
    } )

    const limitSendRequest = (next, request, limit, tasks) => {
        return new Promise( (resolve, reject) => {
            let index = 0
            let count = 0
            const len = tasks.length
            
            const sendRequest = async info => {
                try {
                    await request(info)
                    
                    if (!next()) {
                        return reject('cancel')
                    }
                    if (index > len - 1) return resolve()
                    
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

                    const info = tasks[index]
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
        
        for (const [, item] of tasks.entries()) {
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

    const createChildTasks = (file, childTaskInfo) => {
        const _c = compose(
            curry(sliceFile)(childTaskInfo),
            createFormData,
        )
        
        return _c(file)
    }

    const uploadTask = async file => {
        try {
            const chunkSize =  1024 * 1024 * 10
            const requestLimit = 4

            const { id, name, children } = await createTask(file, chunkSize)
            let num = 0
            const data = reactive({
                name,
                process: 0,
                isStop: false,
            })
            uploadData.uploadTasks.push(data)
            const tasks =  createChildTasks(file, children)
            const up =  curry(limitSendRequest)(
                () => {
                    num++
                    data.process = (num / children.length * 100).toFixed(2)
                    return true
                }, 
                upload, 
                requestLimit
            )
            await up(tasks)
            await mergeFile(id)
        } catch(e) {
            if (e !== 'cancel') throw e
        }
    }

    const runTasks = (runTask, files) => {
        for (const file of files) {
            runTask(file)
        }
    }

    const runUploadTasks = curry(runTasks)(uploadTask)

    return {
        ...uploadData,
        runUploadTasks
    }
}

export default {
  name: "App",
  setup() {
      
    const { uploadTasks, runUploadTasks } = useFileUtils()
    
    const uploads = async event => {
        const files = Array.from(event.target.files)
        runUploadTasks(files)
    }

    return {
      uploadTasks,
      uploads,
    }
  }
}
</script>

<style lang='less' scoped>

.header {
    box-sizing: border-box;
    height: 56px;
    line-height: 56px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #ffd04b;
    background-color: #545c64;
}
.container {
    display: flex;
    height: calc(100% - 56px);
    > .nav {
        box-sizing: border-box;
        width: 150px;
        height: 100%;
        text-align: center;
        color: #fff;
        background-color: #545c64;
        > .menu-item {
            padding: 5px 0;
            font-size: 15px;
            &:hover {
                background-color: #ffd04b;
                cursor: pointer;
            }
        }
    }
    > .content {
        width: calc(100% - 150px);
        > .task-control {
            box-sizing: border-box;
            padding: 10px;
            border-bottom: 1px solid green;
            > button {
                margin-right: 10px;
                cursor: pointer;
                &[disabled] {
                    cursor: no-drop;
                }
            }
        }
        > .task-header {
            display: grid;
            grid-template-columns: repeat(3, 33.3%);
            > .column {
                box-sizing: border-box;
                padding: 10px;
                border-bottom: 1px solid green;
                border-right: 1px solid green;
                &:nth-last-of-type(1) {
                    border-right: 0;
                }
            }
        }
        > .task {
            display: grid;
            grid-template-columns: repeat(3, 33.3%);
            border-bottom: 1px solid black;
            background-color: #fafafa;
            &:hover {
                background-color: paleturquoise;
                cursor: pointer;
            }
            > .task-item {
                box-sizing: border-box;
                padding: 20px 10px;
                &.task-process {
                    display: flex;
                    align-items: center;
                    > .task-twig {
                        width: 20px;
                        height: 10px;
                        overflow: hidden;
                        border-radius: 30px;
                        background-color: green;
                    }
                }
            }
        }
    }
}

</style>
