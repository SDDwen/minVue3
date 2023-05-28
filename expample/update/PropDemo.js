import { h, ref } from '../../lib/guide-min-vue.esm.js'
export default{
  render(){
    const button1 = h('button', {
      onClick: this.handleUpdate
    }, '修改')
    const button2 = h('button', {
      onClick: this.handleDelet, 
    }, '删除')
    const propDemo = h('div', {
      class: 'red',
      ...this.prop
    }, [button1, button2])
    return propDemo
  },
  setup(){
    const prop = ref({
      foo: 'demo',
      bar: 'bar'
    })
    function handleUpdate(){
      prop.value.foo = 'demoCC'
      prop.value.new = 'new'
    }
    function handleDelet(){
      prop.value.bar = undefined
      // prop.value = {
      //   foo: 'demo'
      // }
    }
    return {
      prop,
      handleUpdate,
      handleDelet
    }
  }
}