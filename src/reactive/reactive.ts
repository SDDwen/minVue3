import { 
  mutableHandler, 
  ReactiveFlags, 
  readonlyHandler, 
  shallowHandler 
} from "./baseHandlers"


export function reactive(row){
  return createReactive(row)
}

export function readonly(row){
  return createReadonly(row)
}

export function shallowReadonly(row){
  return createShallowReadonly(row)
}

export function isReactive(value){
  return !!value[ReactiveFlags.REACTIVE_VALUE]
}

export function isReadonly(value){
  return !!value[ReactiveFlags.READONLY_VALUE]
}

function createReactive(row){
  return createActiveObj(row, mutableHandler)
}

function createReadonly(row){
  return createActiveObj(row, readonlyHandler)
}

function createShallowReadonly(row){
  return createActiveObj(row, shallowHandler)
}

function createActiveObj(row, baseHandler){
  return new Proxy(row, baseHandler)
}

