export const compose = (...functions) => {
    const firstFnc = functions.reverse().shift()
    return (...args) => functions.reduce((c, n) => n(c), firstFnc(...args))
  }
  
export const asyncCompose = async (...functions) => {
    const firstFnc = functions.reverse().shift()
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