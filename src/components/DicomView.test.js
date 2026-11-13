import { describe, expect, test, vi } from 'vitest'
import { mount } from "@vue/test-utils";

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import { DwvAppService } from '../services/dwvAppService.js'
import { AnnotationService } from '../services/annotationService.js'
import DicomView from './DicomView.vue'
import TagsTable from './TagsTable.vue'

const vuetify = createVuetify({
  components,
  directives,
})

const mountOptions = {
  global: {
    plugins: [vuetify],
    components: {
      'TagsTable': TagsTable
    }
  }
}

describe('DicomViewComponent', () => {
  const component = mount(DicomView, mountOptions)

  // Inspect the component instance on mount
  test('renders the component', () => {
    expect(component).toBeDefined()
    expect(component).not.toBeNull()
  })

  // Mount an instance and inspect the render output
  test('renders the beginning of the legend', () => {
    const legend = component.get('.legend')
    expect(legend).toBeDefined()
    expect(legend.text()).toContain('Powered by')
  })

  test('renders the closed right panel', () => {
    const panel = component.get('[id$="-rightPanel"]')
    expect(panel.attributes('aria-hidden')).toBe('true')
    expect(component.find('.right-panel-toggle-strip').exists()).toBe(true)
  })

  test('releases the services on unmount', () => {
    const appDispose = vi.spyOn(DwvAppService.prototype, 'dispose')
    const annotDispose = vi.spyOn(AnnotationService.prototype, 'dispose')
    const wrapper = mount(DicomView, mountOptions)
    wrapper.unmount()
    expect(appDispose).toHaveBeenCalledTimes(1)
    expect(annotDispose).toHaveBeenCalledTimes(1)
    appDispose.mockRestore()
    annotDispose.mockRestore()
  })

  describe('data loading', () => {
    const mockLoads = () => ({
      fromUri: vi.spyOn(DwvAppService.prototype, 'loadFromUri')
        .mockImplementation(() => {}),
      urls: vi.spyOn(DwvAppService.prototype, 'loadURLs')
        .mockImplementation(() => {})
    })

    test('does not load without inputs', () => {
      const loads = mockLoads()
      const wrapper = mount(DicomView, mountOptions)
      expect(loads.fromUri).not.toHaveBeenCalled()
      expect(loads.urls).not.toHaveBeenCalled()
      wrapper.unmount()
      vi.restoreAllMocks()
    })

    test('loads from the window location', () => {
      const loads = mockLoads()
      const wrapper = mount(DicomView, {
        ...mountOptions,
        props: { loadFromWindowLocation: true }
      })
      expect(loads.fromUri).toHaveBeenCalledWith(window.location.href)
      wrapper.unmount()
      vi.restoreAllMocks()
    })

    test('loads the uri and urls, on mount and on change', async () => {
      const loads = mockLoads()
      const wrapper = mount(DicomView, {
        ...mountOptions,
        props: { uri: 'https://host/?input=a', urls: ['https://host/b.dcm'] }
      })
      expect(loads.fromUri).toHaveBeenCalledWith('https://host/?input=a')
      expect(loads.urls).toHaveBeenCalledWith(['https://host/b.dcm'])
      await wrapper.setProps({
        uri: 'https://host/?input=c',
        urls: ['https://host/d.dcm']
      })
      expect(loads.fromUri).toHaveBeenLastCalledWith('https://host/?input=c')
      expect(loads.urls).toHaveBeenLastCalledWith(['https://host/d.dcm'])
      expect(loads.fromUri).toHaveBeenCalledTimes(2)
      expect(loads.urls).toHaveBeenCalledTimes(2)
      wrapper.unmount()
      vi.restoreAllMocks()
    })
  })
})
