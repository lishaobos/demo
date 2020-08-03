/* eslint-disable no-debugger */
export const compose = (...functions) => {
    const firstFnc = functions.shift()
    return (...args) => functions.reduce((c, n) => n(c), firstFnc(...args))
  }
  
export const asyncCompose = (...functions) => {
    const firstFnc = functions.shift()
    return (...args) => functions.reduce(async (c, n) => {
            const res = await c
            return n(res)
        }, firstFnc(...args))
}
  
export const curry = fnc => {
    const _fnc = (...args) => {
        if (args.length < fnc.length) {
            return (..._args) =>  _fnc(...args.concat(_args))
        }
        return fnc(...args)
    }

    return _fnc
}