import { effect } from '../effect'
import { isReactive } from '../reactive'
import { isRef, ref, unRef } from '../ref'


describe('ref', ()=>{
  it('happy path', ()=>{
    
    const num = ref(1)
    expect(num.value).toBe(1)
  })
  it('effect when ref', ()=>{
    let dummy = 0
    let calls = 0
    const num = ref(1)
    effect(()=>{
      calls++
      dummy = num.value
    })
    expect(calls).toBe(1)
    num.value = 2
    expect(num.value).toBe(2)
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    num.value = 2
    expect(num.value).toBe(2)
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
  })
  it('effect when ref value is object', ()=>{
    const original = { foo: 1, bar: { num: 1 } }
    const observed = ref(original)

    expect(observed.value.bar.num).toBe(1)

    let dummy
    let calls = 0
    
    effect(()=>{
      calls++
      dummy =observed.value.bar.num
    })
    observed.value.bar.num = 2
    expect(observed.value.bar.num).toBe(2)
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
    observed.value.bar.num = 2
    expect(observed.value.bar.num).toBe(2)
    expect(dummy).toBe(2)
    expect(calls).toBe(3)

  })
  it('value is ref', ()=>{
    const original = { foo: 1, bar: { baz: 'bo' }}
    const observed = ref(original)
    expect(isRef(observed)).toBe(true)
    expect(isReactive(observed.value.bar)).toBe(true)
    expect(isRef(original)).toBe(false)
  })
  it('unRef test', ()=>{
    const a = 1
    const dummy = ref(1)
    const dummyBoolen = ref(false)
    expect(unRef(dummy)).toBe(1)
    expect(unRef(a)).toBe(1)
    expect(unRef('a')).toBe('a')
    expect(unRef(dummyBoolen)).toBe(false)
  })
})