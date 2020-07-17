<template>
  <div id="app">
    <input type="file" multiple @change="uploads" />
    <button @click="mkFile">合并</button>
  </div>
</template>

<script>
/* eslint-disable no-debugger */
import { upload, mergeFile } from "./apis/common"
import { compose, curry } from './assets/js'

const useFileUtils = () => {

    const createFormData = (name, type, chunks) => {
        const arr = []
        const time = Date.now()

        for (const [index, item] of chunks.entries()) {
            const formData = new FormData()
            formData.append("index", index)
            formData.append("name", `${name}-${time}`)
            formData.append("type", type)
            formData.append("file", item)

            arr.push(formData)
        }

        return arr
    }

    const sliceFile = (piece, file) => {
        piece = piece || 1024 * 1024 * 5
        let start = 0
        let end = piece
        const chunks = []

        while (start <= file.size) {
            const chunk = file.slice(start, end)
            chunks.push(chunk)

            start = end
            end += piece
        }

        return chunks
    }

    const sendRequest = (upload, limit, list) => {
        return new Promise( (resolve) => {
            let index = 0
            let count = 0
            const len = list.length
            const start = () => {
                while (index < len) {
                    if (count >= limit)  return

                    count++
                    const info = list[index++]
                    upload(info).then( () => {
                        if (index === len - 1) return resolve()
                        
                        count--
                        start()
                    })
                }
            }

            start()
        })
    }

    const uploadFiles = async file => {
        const [name, type] = file.name.split(".")

        const _uploads = compose(
            curry(sendRequest)(upload, 5),
            curry(createFormData)(name, type),
            curry(sliceFile)(1024 * 1024 * 5)
        )
            
        const result = await _uploads(file)
        console.log(result)
    }

    return {
        createFormData,
        sliceFile,
        sendRequest,
        uploadFiles
    }
}

const mkFile = () => {
    mergeFile()
}

export default {
  name: "App",
  setup() {
      
    const { uploadFiles } = useFileUtils()
    const uploads = event => {
        const file = event.target.files[0]
        uploadFiles(file)
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
