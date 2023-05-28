import { h, ref } from "../../lib/guide-min-vue.esm.js"

export default{
  render(){
    const TextChildren = 'oldTextChildren'
    const ArrayChildren = [h('p', {}, 'A'), h('p', {}, 'B')]
    return h('div', { class: 'textToArray' }, this.isChange ? TextChildren : ArrayChildren) 
  },
  setup(){
    const isChange = ref(true)
    window.isChange = isChange
    return {
      isChange
    }
  }
}