import { computed } from '../computed'
import { reactive } from '../reactive'
describe('computed', ()=>{
  it('haapy path', () => {
    const value = reactive({foo: 1})
    const getter = jest.fn(()=>{
      return value.foo
    })
    const cValue =  computed(()=>{
      return getter()
    })
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})