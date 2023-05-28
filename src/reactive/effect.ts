import { extend } from "../shared/index"

interface IOptions<T = unknown>{
  scheduler?: () => T,
  onStop?: () => T
}
interface IRunner{
  (): unknown,
  effect?: ReactiveEffect
}

let activeEffect: ReactiveEffect
let shouldEffect = false
export class ReactiveEffect<T = unknown>{
  private _fn
  private _activity = true
  deps: Set<ReactiveEffect>[] = []
  scheduler: ()=> T
  public onStop
  constructor(fn, scheduler){
    this._fn = fn
    this.scheduler = scheduler
  }
  run(){
    if(!this._activity){
      return this._fn()

    }
    activeEffect = this
    shouldEffect = true
    const result = this._fn()
    shouldEffect = false
    return result
  }
  stop(){
    if(!this._activity) return
    cleanupEffect(this)
    this._activity = false
  }
}


// 清除effect中dep
function cleanupEffect(effect: ReactiveEffect){
  const { deps } = effect
  deps.forEach(dep=>{
    dep.delete(effect)
  })
  deps.length = 0
}


const targetMap = new Map()
/**
 * @param target -收集的对象
 * @param key  
 * @desc 依赖收集
 */

export function track(target, key){
  if(!shouldTrack()) return
  let depMap = targetMap.get(target)
  if(!depMap){
    depMap = new Map()
    targetMap.set(target, depMap)
  }
  let dep = depMap.get(key)
  if(!dep){
    dep = new Set()
    depMap.set(key, dep)
  }
  trackEffect(dep)
}

export function trackEffect(dep: Set<ReactiveEffect>){
  if(!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}


export function trigger(target, key){
  const depMap = targetMap.get(target)
  const dep = depMap.get(key)
  triggerEffect(dep)
}

/**
 * @param target -收集的对象
 * @param key  
 * @desc 依赖响应
 */
export function triggerEffect(dep:Set<ReactiveEffect>){
  for(let effect of dep){
    if(effect.scheduler){
      effect.scheduler()
    }else{
      effect.run()
    }
  }
}


// 是否应该track
export function shouldTrack(){
  return !!activeEffect && shouldEffect 
}

export function effect(fn, options: IOptions = {}){
  const { scheduler } = options
  const _effect = new ReactiveEffect(fn, scheduler)
  extend(_effect, options)
  const runner: IRunner = _effect.run.bind(_effect)
  runner.effect = _effect
  runner()
  return runner
}


export function stop(runner: IRunner){
  const { effect } = runner
  if(!(effect instanceof ReactiveEffect)) return
  const {  onStop  } = effect
  effect.stop()
  typeof onStop =='function' && onStop()
  
}
