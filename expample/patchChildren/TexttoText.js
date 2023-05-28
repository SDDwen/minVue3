import { h, ref } from "../../lib/guide-min-vue.esm.js"

export default{
  render(){
    const newText = 'newText'
    const oldText = 'oldText'
    return h('div', {}, this.isChange ? oldText : newText)
  },
  setup(){
    const isChange = ref(true)
    window.isChange = isChange
    return {
      isChange
    }
  }
}