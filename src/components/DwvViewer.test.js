import { describe, expect, test, vi } from 'vitest'
import { mount } from "@vue/test-utils";

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import { DwvAppService } from '../services/dwvAppService.js'
import { AnnotationService } from '../services/annotationService.js'
import DwvViewer from './DwvViewer.vue'
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

describe('DwvViewerComponent', () => {
  const component = mount(DwvViewer, mountOptions)

  // Inspect the component instance on mount
  test('renders the component', () => {
    expect(component).toBeDefined()
    expect(component).not.toBeNull()
  })

  test('does not render the legend by default', () => {
    expect(component.find('.legend').exists()).toBe(false)
  })

  test('renders the legend with showLegend', () => {
    const wrapper = mount(DwvViewer, {
      ...mountOptions,
      props: { showLegend: true }
    })
    const legend = wrapper.get('.legend')
    expect(legend.text()).toContain('Powered by')
    wrapper.unmount()
  })

  test('renders the closed right panel', () => {
    const panel = component.get('[id$="-rightPanel"]')
    expect(panel.attributes('aria-hidden')).toBe('true')
    expect(component.find('.right-panel-toggle-strip').exists()).toBe(true)
  })

  test('releases the services on unmount', () => {
    const appDispose = vi.spyOn(DwvAppService.prototype, 'dispose')
    const annotDispose = vi.spyOn(AnnotationService.prototype, 'dispose')
    const wrapper = mount(DwvViewer, mountOptions)
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
      const wrapper = mount(DwvViewer, mountOptions)
      expect(loads.fromUri).not.toHaveBeenCalled()
      expect(loads.urls).not.toHaveBeenCalled()
      wrapper.unmount()
      vi.restoreAllMocks()
    })

    test('loads from the window location', () => {
      const loads = mockLoads()
      const wrapper = mount(DwvViewer, {
        ...mountOptions,
        props: { loadFromWindowLocation: true }
      })
      expect(loads.fromUri).toHaveBeenCalledWith(window.location.href)
      wrapper.unmount()
      vi.restoreAllMocks()
    })

    test('uri takes precedence over urls and window location', async () => {
      const loads = mockLoads()
      const wrapper = mount(DwvViewer, {
        ...mountOptions,
        props: {
          uri: 'https://host/?input=a',
          urls: 'https://host/b.dcm',
          loadFromWindowLocation: true
        }
      })
      expect(loads.fromUri).toHaveBeenCalledTimes(1)
      expect(loads.fromUri).toHaveBeenCalledWith('https://host/?input=a')
      expect(loads.urls).not.toHaveBeenCalled()
      // urls change ignored while uri is set
      await wrapper.setProps({ urls: 'https://host/c.dcm' })
      expect(loads.urls).not.toHaveBeenCalled()
      // uri change reloads
      await wrapper.setProps({ uri: 'https://host/?input=d' })
      expect(loads.fromUri).toHaveBeenLastCalledWith('https://host/?input=d')
      expect(loads.fromUri).toHaveBeenCalledTimes(2)
      wrapper.unmount()
      vi.restoreAllMocks()
    })

    test('urls take precedence over window location', async () => {
      const loads = mockLoads()
      const wrapper = mount(DwvViewer, {
        ...mountOptions,
        props: {
          urls: 'https://host/b.dcm',
          loadFromWindowLocation: true
        }
      })
      expect(loads.urls).toHaveBeenCalledWith(['https://host/b.dcm'])
      expect(loads.fromUri).not.toHaveBeenCalled()
      // urls change reloads
      await wrapper.setProps({ urls: ' https://host/c.dcm\n  https://host/d.dcm ' })
      expect(loads.urls).toHaveBeenLastCalledWith(
        ['https://host/c.dcm', 'https://host/d.dcm'])
      expect(loads.urls).toHaveBeenCalledTimes(2)
      wrapper.unmount()
      vi.restoreAllMocks()
    })
  })
})
