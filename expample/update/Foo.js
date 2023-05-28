import { h ,ref } from '../../lib/guide-min-vue.esm.js'

export default {
  render(){
    const button = h('button', {
      onClick: this.handleClick,
    }, '点击')

    const text = h('p',{
      class: 'text'
    }, `this.count:${this.count}`)

    const foo = h('div', {
      class: 'foo'
    }, [button, text])
    return foo
  },
  setup(){
    const count = ref(0)
    function handleClick(){
      count.value += 1
      console.log(count.value)
    }
    return {
      handleClick,
      count
    }
  }
}