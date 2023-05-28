import { ReactiveEffect } from "./effect"
class ComputedImpl{
  private _value
  private _effect: ReactiveEffect
  private _dirty = true
  constructor(runner){
    // 当时响应数字发生改变执行schedluer
    this._effect = new ReactiveEffect(runner, ()=>{
      !this._dirty && (this._dirty = true)
    })
  }
  get value(){
    if(this._dirty){
      this._value = this._effect.run()
      this._dirty = false
    }
    return this._value
  }
}

export function computed(runner){
  return new ComputedImpl(runner)
}