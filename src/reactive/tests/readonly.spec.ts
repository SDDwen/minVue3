import { readonly, isReadonly } from '../reactive'
describe('readonly', ()=>{
  it('happy path', ()=>{
    const original = { name: 'Dom', age: 29 }
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.age).toBe(29)
  })
  it('warning then cell set', ()=>{
    console.warn = jest.fn()
    const original = { name: 'Dom', age: 29 }
    const observed = readonly(original)
    observed.age++
    expect(console.warn).toHaveBeenCalled()
  })
  it('is Readonly', ()=>{
    const original = { foo: 1 }
    const observed = readonly(original)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(original)).toBe(false)
  })
  it('readonly 嵌套', ()=>{
    const original = { foo: 1, bar: { baz: 'bo' }}
    const observed = readonly(original)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(observed.bar)).toBe(true)
  })
})