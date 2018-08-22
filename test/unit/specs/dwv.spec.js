import Vue from 'vue'
import '../xhr-mock.js'
import dwvComp from '@/components/dwv'

describe('DwvComponent', () => {
  // Inspect the component instance on mount
  it('renders the component', () => {
    const component = new Vue(dwvComp).$mount()
    expect(component).toBeDefined()
    expect(component).not.toBeNull()
  })

  // Mount an instance and inspect the render output
  it('renders the beginning of the legend', () => {
    const component = new Vue(dwvComp).$mount()
    const legend = component.$el.querySelector('.legend')
    expect(legend.textContent).toContain('Powered by')
  })
})
