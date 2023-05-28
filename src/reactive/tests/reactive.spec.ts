import { reactive, isReactive } from '../reactive'
describe('reactive', ()=>{
  it('happy path', ()=>{
    const original = {
      name: 'Dom',
      age: 10
    }
    const observed = reactive(original)
    expect(original).not.toBe(observed)
  })
  it('is Readonly', ()=>{
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
  })
  it('reactive 嵌套', ()=>{
    const original = { foo: 1, bar: { baz: 'bo' }}
    const observed = reactive(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.bar)).toBe(true)
  })
})