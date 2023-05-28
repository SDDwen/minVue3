import { h } from '../../lib/guide-min-vue.esm.js'
import ArraytoText from './ArraytoText.js'
import TexttoArray from './TexttoArray.js'
import TexttoText from './TexttoText.js'
import ArraytoArray from './ArraytoArray.js'
export default{
  render(){
    return h('div', { class: 'app' }, [
      // h(ArraytoText)
      // h(TexttoText)
      // h(TexttoArray)
      h(ArraytoArray)
    ])
  }
}