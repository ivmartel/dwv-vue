import Vue from 'vue'
import dwv from '@/components/dwv'

describe('dwv.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(dwv)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.legend').textContent)
      .toEqual('Powered by dwv')
  })
})
