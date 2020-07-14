<template>
  <div id="app">
    <input type="file" multiple @change="uploads" />
    <button @click="merge">合并</button>
  </div>
</template>

<script>
/* eslint-disable no-debugger */
import { upload, mergeFile } from "./apis/common";

const compose = (...functions) => {
  const firstFnc = functions.reverse().shift();
  return (...args) => functions.reduce((c, n) => n(c), firstFnc(...args));
};

// const asyncCompose = async (...functions) => {
//   const firstFnc = functions.reverse().shift();
//   return (...args) => functions.reduce(async (c, n) => {
//       const res = await c
//       return n(res)
//   }, firstFnc(...args));
// };

const curry = fnc => {
  const _fnc = (...args) => {
    if (args.length < fnc.length) {
      return (..._args) =>  _fnc(...args.concat(_args));
    }
    return fnc(...args);
  };

  return _fnc;
};

export default {
  name: "App",

  setup() {
    const createFormData = (name, type, chunks) => {
      const arr = [];
      const time = Date.now();

      for (const [index, item] of chunks.entries()) {
        const formData = new FormData();
        formData.append("index", index);
        formData.append("name", `${name}-${time}`);
        formData.append("type", type);
        formData.append("file", item);

        arr.push(formData);
      }

      return arr;
    };

    const sliceFile = (piece, file) => {
      piece = piece || 1024 * 1024 * 5;
      let start = 0;
      let end = piece;
      const chunks = [];

      while (start <= file.size) {
        const chunk = file.slice(start, end);
        chunks.push(chunk);

        start = end;
        end += piece;
      }

      return chunks;
    };

    const uploads = async event => {
      const file = event.target.files[0];
      const [name, type] = file.name.split(".");

      const fnc = compose(
        curry(createFormData)(name, type),
        curry(sliceFile)(1024 * 1024 * 5)
      );
        
      const chunksInfo = fnc(file);
    
      const tasks = chunksInfo.map(info => upload(info));
      const result = await Promise.allSettled(tasks);
      
      console.log(result)
    };

    const merge = () => {
        mergeFile()
    }

    return {
      uploads,
      merge
    };
  }
};
</script>

<style>
</style>
