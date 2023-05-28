import { h } from '../../lib/guide-min-vue.esm.js'
import Foo from './Foo.js'
window.self
export default {
  name: 'App',
  render(){
    window.self = this
    // const foo = h(Foo, { 
    //   count: 1, 
    //   onAdd: (a, b)=>{
    //     console.log('onAdd')
    //     console.log(a, b)
    //   }  
    // }, h('div', null, 'solt on foo'))
    const foo = h(Foo, {
      name: 'DomCC',
      onAdd: (a, b) => {
        console.log(a, b)
      }
    })
    return h('div', { 
      class: 'blue',
      onClick: (event)=>{
        console.log(event)
        event.stopPropagation()
        console.log('APP CLICK')
      },
    }, [foo]
    )
  },
  setup(){
    return {
      msg: 'Dom'
    }
  }
}