import { describe, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import AnnotationList from './AnnotationList.vue'

const vuetify = createVuetify({ components, directives })

/**
 * Fake annotation service with a settable state.
 *
 * @param {object} state The initial state.
 * @returns {object} The service.
 */
function getFakeService(state) {
  const listeners = new Set()
  const service = new EventTarget()
  Object.assign(service, {
    state,
    getSnapshot: () => service.state,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setState: (newState) => {
      service.state = newState
      listeners.forEach((listener) => listener())
    },
    setAnnotationGroupEditable: vi.fn(),
    setLabelsVisibility: vi.fn(),
    setAnnotationVisibility: vi.fn(),
    changeAnnotationColour: vi.fn(),
    deleteAnnotation: vi.fn(),
    selectAnnotation: vi.fn(),
    gotoAnnotation: vi.fn(),
    getAnnotationGroupAsDicom: vi.fn()
  })
  return service
}

const annotation = {
  id: 'a1',
  label: 'ruler 1',
  colour: '#ffff80',
  shapeName: 'ruler',
  canView: true,
  visible: true,
  quantification: { length: { value: 12.345, unit: 'unit.mm' } }
}

function mountList(service) {
  return mount(AnnotationList, {
    global: {
      plugins: [vuetify],
      provide: { AnnotationService: service, viewerId: 'viewer0' }
    }
  })
}

describe('AnnotationList', () => {
  test('renders nothing without groups', () => {
    const wrapper = mountList(getFakeService({ groups: [] }))
    expect(wrapper.find('.group-list').exists()).toBe(false)
  })

  test('renders an empty group', () => {
    const wrapper = mountList(getFakeService({
      groups: [{ dataId: '1', editable: true, labelsVisible: true, annotations: [] }]
    }))
    expect(wrapper.get('.group-name').text()).toBe('group #1')
    expect(wrapper.get('.annotation-list .empty').text()).toBe('No annotation')
  })

  test('renders annotations and calls the service', async () => {
    const service = getFakeService({
      groups: [{
        dataId: '1', editable: false, labelsVisible: true,
        annotations: [annotation, { ...annotation, id: 'a2', canView: false, quantification: {} }]
      }]
    })
    const wrapper = mountList(service)
    const item = wrapper.get('#viewer0-annotationgroup1-annotationa1')
    expect(item.get('.annotation-label').text()).toBe('ruler 1')
    // locked group
    expect(wrapper.get('[title="Lock/unlock annotation group"]')
      .attributes('aria-pressed')).toBe('true')
    expect(item.get('input[type="color"]').element.disabled).toBe(true)
    expect(item.get('[title="Delete annotation"]').element.disabled).toBe(true)
    // not viewable
    expect(wrapper.get('#viewer0-annotationgroup1-annotationa2 .annotation-label')
      .classes()).toContain('not-viewable')

    await item.get('.annotation-content').trigger('click')
    expect(service.selectAnnotation).toHaveBeenCalledWith('1', 'a1')
    expect(service.gotoAnnotation).toHaveBeenCalledWith('1', 'a1')

    await item.get('[title="Show/hide annotation"]').trigger('click')
    expect(service.setAnnotationVisibility).toHaveBeenCalledWith('1', 'a1', false)

    await wrapper.get('[title="Lock/unlock annotation group"]').trigger('click')
    expect(service.setAnnotationGroupEditable).toHaveBeenCalledWith('1', true)
  })

  test('toggles the quantification details', async () => {
    const wrapper = mountList(getFakeService({
      groups: [{
        dataId: '1', editable: true, labelsVisible: true,
        annotations: [annotation, { ...annotation, id: 'a2', quantification: {} }]
      }]
    }))
    const info = wrapper.get('#viewer0-annotationgroup1-annotationa1 [title="Show/hide quantification"]')
    expect(info.attributes('aria-expanded')).toBe('false')
    expect(info.attributes('aria-controls'))
      .toBe('viewer0-qd-annotationgroup1-annotationa1')
    await info.trigger('click')
    expect(info.attributes('aria-expanded')).toBe('true')
    expect(info.attributes('aria-pressed')).toBe('true')
    const details = wrapper.get('#viewer0-qd-annotationgroup1-annotationa1')
    expect(details.get('.quantification-title').text()).toBe('Geometry')
    expect(details.get('dt').text()).toBe('length')
    expect(details.get('dd').text()).toBe('12.35 mm')

    await wrapper.get('#viewer0-annotationgroup1-annotationa2 [title="Show/hide quantification"]')
      .trigger('click')
    expect(wrapper.get('#viewer0-qd-annotationgroup1-annotationa2').text())
      .toBe('No quantification')
  })

  test('renders the selection', async () => {
    const group = { dataId: '1', editable: true, labelsVisible: true, annotations: [annotation] }
    const service = getFakeService({ groups: [group] })
    const wrapper = mountList(service)
    const scroll = vi.fn()
    wrapper.get('#viewer0-annotationgroup1-annotationa1').element.scrollIntoView = scroll
    service.setState({ groups: [group], selected: { dataId: '1', annotationId: 'a1' } })
    await nextTick()
    await nextTick()
    expect(wrapper.get('#viewer0-annotationgroup1-annotationa1').classes()).toContain('selected')
  })
})
