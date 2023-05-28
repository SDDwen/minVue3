import { reactive } from '../reactive'
import { effect, stop } from '../effect'
describe('effect', ()=>{
  it('happy path', ()=>{
    const observed = reactive({
      age: 10
    })
    let dunnay
    effect(()=>{
      dunnay = observed.age 
    })
    expect(observed.age).toBe(10)
    expect(dunnay).toBe(10)
    observed.age ++
    expect(dunnay).toBe(11)
  })
  it('effect run when call effect', ()=>{
    let dunnay = 0
    const observed = reactive({
      age: 10
    })
    
    const runner =  effect(()=>{
      dunnay += observed.age
    })
    expect(observed.age).toBe(10)
    expect(dunnay).toBe(10)
    runner()
    expect(dunnay).toBe(20)
  })
  it('scheduler', ()=>{
    let run
    let runner
    let dunnay = 0
    const scheduler = jest.fn(()=>{
      run = runner
    })
    const observed = reactive({
      age: 10
    })
    runner =  effect(()=>{
      dunnay += observed.age
    }, { scheduler })
    expect(observed.age).toBe(10)
    expect(dunnay).toBe(10)
    runner()
    expect(dunnay).toBe(20)

    observed.age++
    expect(dunnay).toBe(20) 
    expect(scheduler).toHaveBeenCalledTimes(1)
    run()
    expect(dunnay).toBe(31) 
  })
  it('stop onStop of effect', ()=>{
    let runner
    let dunnay
    const onStop = jest.fn()
    const observed = reactive({age: 10})
    runner = effect(()=>{
      dunnay = observed.age
    }, { onStop })
    observed.age ++
    expect(dunnay).toBe(11)
    stop(runner)
    observed.age++
    expect(dunnay).toBe(11)
    expect(onStop).toBeCalledTimes(1)
    stop(runner)
    expect(onStop).toBeCalledTimes(2)

    runner()
    expect(dunnay).toBe(12)
    observed.age++
    expect(dunnay).toBe(12)
  })
})