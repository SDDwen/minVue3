import { h } from '../../lib/guide-min-vue.esm.js'
import Foo from './Foo.js'
import PropDemo from './PropDemo.js'
export default{
  render(){
    const foo = h(Foo)
    const propDemo = h(PropDemo)
    const app = h('div', {
      class:'blue'
    }, [foo, propDemo])
    return app
  }
}