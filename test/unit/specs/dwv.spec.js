import Vue from 'vue'
import '../xhr-mock.js'
import dwv from '@/components/dwv'

describe('dwv.vue', () => {
  // Inspect the component instance on mount
  it('sets an onClick hook when created', () => {
    const vm = new Vue(dwv).$mount()
    expect(typeof vm.onClick).toBe('function')
  })

  // Inspect the component instance on mount
  it('correctly sets the legend when created', () => {
    const vm = new Vue(dwv).$mount()
    expect(vm.legend).toContain('Powered by dwv')
  })

  // Mount an instance and inspect the render output
  it('renders the correct legend', () => {
    const Constructor = Vue.extend(dwv)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.legend').textContent)
      .toContain('Powered by dwv')
  })
})
