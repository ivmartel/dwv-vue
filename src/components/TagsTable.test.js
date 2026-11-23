import { describe, expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createVuetify } from 'vuetify'

import TagsTable from './TagsTable.vue'

const vuetify = createVuetify({ components, directives })

/**
 * Mount the tags table.
 *
 * @param {object} tagsData The meta data.
 * @returns {object} The wrapper.
 */
function mountTable(tagsData) {
  return mount(TagsTable, {
    props: { tagsData },
    global: { plugins: [vuetify] }
  })
}

/**
 * Get a tag value from the table items.
 *
 * @param {object} wrapper The wrapper.
 * @param {string} name The tag name.
 * @returns {string|undefined} The value.
 */
function getValue(wrapper, name) {
  return wrapper.vm.searched.find(item => item.name === name)?.value
}

// single item meta data, as stored by dwv (values are arrays)
const singleMeta = {
  '00020010': { vr: 'UI', value: ['1.2.840.10008.1.2.1'] },
  '00100010': { vr: 'PN', value: ['Doe^John'] },
  '00200013': { vr: 'IS', value: ['7'] },
  '00281050': { vr: 'DS', value: [40, 400] }
}

// merged meta data: 'mergeId' lists the item ids, item dependent
// values are indexed by these ids
const mergedMeta = {
  mergeId: ['10', '2', '1'],
  '00020010': { vr: 'UI', value: ['1.2.840.10008.1.2.1'] },
  '00100010': { vr: 'PN', value: ['Doe^John'] },
  '00200013': {
    vr: 'IS',
    value: { 1: ['1'], 2: ['2'], 10: ['10'] }
  },
  '00080018': {
    vr: 'UI',
    value: { 1: ['1.1'], 2: ['1.2'], 10: ['1.10'] }
  },
  '00081140': {
    vr: 'SQ',
    value: {
      1: [{ '00081155': { vr: 'UI', value: ['ref.1'] } }],
      2: [{ '00081155': { vr: 'UI', value: ['ref.2'] } }],
      10: [{ '00081155': { vr: 'UI', value: ['ref.10'] } }]
    }
  }
}

describe('TagsTable', () => {
  test('displays single item meta data', () => {
    const wrapper = mountTable(singleMeta)
    expect(getValue(wrapper, 'PatientName')).toBe('Doe^John')
    expect(getValue(wrapper, 'InstanceNumber')).toBe('7')
    expect(getValue(wrapper, 'WindowCenter')).toBe('40,400')
    expect(wrapper.vm.instanceNumber).toBe('7')
    expect(wrapper.vm.sliderMax).toBeUndefined()
  })

  test('displays merged meta data per item', async () => {
    const wrapper = mountTable(mergedMeta)
    // no row for the merge ids
    expect(wrapper.vm.searched.some(item => item.name.startsWith('x')))
      .toBe(false)
    // sorted ids, first item selected
    expect(wrapper.vm.itemIds).toEqual(['1', '2', '10'])
    expect(wrapper.vm.sliderMax).toBe(2)
    expect(wrapper.vm.instanceNumber).toBe('1')
    expect(getValue(wrapper, 'PatientName')).toBe('Doe^John')
    expect(getValue(wrapper, 'InstanceNumber')).toBe('1')
    expect(getValue(wrapper, 'SOPInstanceUID')).toBe('1.1')
    expect(getValue(wrapper, '[0] ReferencedSOPInstanceUID')).toBe('ref.1')

    // select the last item
    wrapper.vm.sliderIndex = 2
    await nextTick()
    expect(wrapper.vm.instanceNumber).toBe('10')
    expect(getValue(wrapper, 'InstanceNumber')).toBe('10')
    expect(getValue(wrapper, 'SOPInstanceUID')).toBe('1.10')
    expect(getValue(wrapper, '[0] ReferencedSOPInstanceUID')).toBe('ref.10')
  })

  test('resets on new data', async () => {
    const wrapper = mountTable(mergedMeta)
    wrapper.vm.sliderIndex = 1
    await nextTick()
    await wrapper.setProps({ tagsData: singleMeta })
    expect(wrapper.vm.itemIds).toEqual([])
    expect(wrapper.vm.instanceNumber).toBe('7')
    expect(getValue(wrapper, 'InstanceNumber')).toBe('7')
  })
})
