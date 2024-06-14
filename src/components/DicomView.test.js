import { describe, expect, test } from 'vitest'
import { mount } from "@vue/test-utils";

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import DicomView from './DicomView.vue'
import TagsTable from './TagsTable.vue'

const vuetify = createVuetify({
  components,
  directives,
})

describe('DicomViewComponent', () => {
  const component = mount(DicomView,
    {
      global: {
        plugins: [vuetify],
        components: {
          'TagsTable': TagsTable
        }
      }
    }
  )

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
})
