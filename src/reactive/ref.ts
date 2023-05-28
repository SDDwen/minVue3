import { hasChange, isObject } from "../shared/index"
import { ReactiveEffect, shouldTrack, trackEffect, triggerEffect } from "./effect"
import { reactive } from "./reactive"

class RefImpl{
  private _value
  private _rowValue
  public _is_ref_value_ = true
  public dep: Set<ReactiveEffect>  = new Set()
  constructor(value){
    this._value = convert(value)
    this._rowValue = value
  }
  get value(){
    if(shouldTrack()){
      trackEffect(this.dep)
    }
    return this._value
  }
  set value(newValue){
    if(hasChange(this._rowValue, newValue)){
      this._value = convert(newValue)
      this._rowValue = newValue
      triggerEffect(this.dep)
    }
  }
}

function convert(value){
  return isObject(value) ? reactive(value) : value
}
 
export function ref(value){
  return new RefImpl(value)
}

export function isRef(value){
  return !!value?._is_ref_value_
}

export function unRef(row){
  return isRef(row) ? row.value :  row
}