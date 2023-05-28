import { h } from '../../lib/guide-min-vue.esm.js'
window.self
export default {
  name: 'Foo',
  render(){
    window.self = this
    return h('h2', { 
      class: 'foo-blue',
      onClick: this.onFooEmit
    },
    this.msg)
  },
  setup(props, { emit }){
    console.log(props)
    props.count = 2
    function onFooEmit(event){
      console.log(event)
      event.stopPropagation()
      emit('add', 1, 2)
    }
    return {
      msg: 'Dom',
      onFooEmit
    }
  }
}