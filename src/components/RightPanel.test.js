import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import RightPanel from './RightPanel.vue'

const vuetify = createVuetify({ components, directives })

function mountPanel() {
  return mount(RightPanel, {
    attachTo: document.body,
    global: { plugins: [vuetify], provide: { viewerId: 'viewer0' } },
    slots: { default: '<p class="slot-content">content</p>' }
  })
}

describe('RightPanel', () => {
  test('is closed initially', () => {
    const wrapper = mountPanel()
    const panel = wrapper.get('aside')
    expect(panel.attributes('aria-hidden')).toBe('true')
    expect(panel.attributes('inert')).toBeDefined()
    expect(panel.element.style.width).toBe('0px')
    expect(wrapper.find('.right-panel-toggle-strip').exists()).toBe(true)
    expect(wrapper.find('.slot-content').exists()).toBe(true)
    wrapper.unmount()
  })

  test('opens and closes with the toggle, moving the focus', async () => {
    const wrapper = mountPanel()
    await wrapper.get('.right-panel-toggle-strip button').trigger('click')
    await nextTick()
    const panel = wrapper.get('aside')
    expect(panel.attributes('aria-hidden')).toBeUndefined()
    expect(panel.attributes('inert')).toBeUndefined()
    expect(panel.element.style.width).toBe('300px')
    expect(wrapper.find('.right-panel-toggle-strip').exists()).toBe(false)
    const headerToggle = wrapper.get('.right-panel-header button')
    expect(headerToggle.attributes('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(headerToggle.element)

    await headerToggle.trigger('click')
    await nextTick()
    expect(panel.attributes('aria-hidden')).toBe('true')
    const stripToggle = wrapper.get('.right-panel-toggle-strip button')
    expect(document.activeElement).toBe(stripToggle.element)
    wrapper.unmount()
  })

  test('resizes with the keyboard', async () => {
    window.innerWidth = 1000
    const wrapper = mountPanel()
    const handle = wrapper.get('[role="separator"]')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(handle.attributes('aria-valuenow')).toBe('320')
    await handle.trigger('keydown', { key: 'Home' })
    expect(handle.attributes('aria-valuenow')).toBe('200')
    await handle.trigger('keydown', { key: 'End' })
    expect(handle.attributes('aria-valuenow')).toBe('500')
    expect(handle.attributes('aria-valuemax')).toBe('500')
    // content keeps the open width
    expect(wrapper.get('.right-panel-content').element.style.width)
      .toBe('500px')
    wrapper.unmount()
  })
})
