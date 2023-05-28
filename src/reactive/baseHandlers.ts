import { reactive, readonly } from './reactive'
import { extend, isObject } from "../shared/index"
import { track, trigger } from "./effect"


export const enum ReactiveFlags{
  REACTIVE_VALUE = '_is_value_reactie',
  READONLY_VALUE = '_is_value_readonly'
}

const getter = createGetter()
const setter = createSetter()
const readonlyGetter = createGetter(true)
const shallowGetter = createGetter(false, true)

// 创建getter
function createGetter(isReadonly = false, isShallow = false){
  return function get(target, key){
    const res = Reflect.get(target, key)
    if(!isReadonly){
      track(target, key)
    }
    if(key === ReactiveFlags.REACTIVE_VALUE){
      return !isReadonly
    }else if(key === ReactiveFlags.READONLY_VALUE){
      return isReadonly
    }
    if(isShallow){
      return res
    }
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}


// 创建setter
function createSetter(){
  return function set(target, key, value){
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandler = {
  get: getter,
  set: setter
}

export const readonlyHandler = {
  get: readonlyGetter,
  set(){
    console.warn('target is readonly, key can\'t be setter')
    return true
  }
}

export const shallowHandler = extend({}, readonlyHandler, {
  get: shallowGetter
})
