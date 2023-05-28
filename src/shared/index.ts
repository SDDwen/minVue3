export const extend = Object.assign
export function isObject(value){
  if(value !== null && typeof value === 'object') return true
}

export function hasChange(value, newValue){
  return !Object.is(value, newValue)
}

export function hasOwn(object, key){
  return Object.prototype.hasOwnProperty.call(object,key)
}

export const EMPTY_OBJ = {}