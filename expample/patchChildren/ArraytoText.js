import { h, ref } from '../../lib/guide-min-vue.esm.js'
export default {
  render(){
    const textNode = 'nextChildren'
    const arrNodes = [h('p', {}, 'P1'), h('p', {}, 'P2')]
    return h('div', { class: 'arrToTxt' }, this.isChange ?  arrNodes : textNode )
  },
  setup(){
    const isChange = ref(true)
    window.isChange = isChange
    return {
      isChange
    }
  }
}