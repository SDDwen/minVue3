import { isReactive, shallowReadonly } from "../reactive"

describe('shallowReadonly', ()=>{
  it('happy path', ()=>{
    console.warn = jest.fn()
    const original = { name: 'Dom', baz: { bar: 1 }}
    const observed = shallowReadonly(original)
    expect(observed).not.toBe(original)
    expect(observed.name).toBe('Dom')
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.baz)).toBe(false)
    observed.name = 'Steve'
    expect(console.warn).toHaveBeenCalled()
  })
})