import { describe, expect, test, vi } from 'vitest'

import { AnnotationService } from './annotationService.js'

/**
 * Fake annotation.
 *
 * @param {string} id The tracking UID.
 * @returns {object} The annotation.
 */
function getFakeAnnotation(id) {
  return {
    trackingUid: id,
    trackingId: 'label-' + id,
    colour: '#ffff80',
    quantification: undefined,
    getFactory: () => undefined,
    canView: () => true,
    getCentroid: () => ({ x: 1, y: 2 })
  }
}

/**
 * Fake dwv app service with one annotation group (data id '1')
 *   holding two annotations ('a0' and 'a1') and one draw layer.
 *
 * @returns {object} The service and its draw layer.
 */
function getFakeDwvAppService() {
  const annotations = [getFakeAnnotation('a0'), getFakeAnnotation('a1')]
  const annotationGroup = new EventTarget()
  Object.assign(annotationGroup, {
    isEditable: () => true,
    getList: () => annotations,
    find: (id) => annotations.find((item) => item.trackingUid === id)
  })
  const drawLayer = {
    setCurrentPosition: vi.fn(),
    highlightAnnotation: vi.fn()
  }
  const service = new EventTarget()
  Object.assign(service, {
    getData: (dataId) => dataId === '1' ? { annotationGroup } : undefined,
    getDrawLayersByDataId: (dataId) => dataId === '1' ? [drawLayer] : []
  })
  return { service, drawLayer }
}

/**
 * Get a connected annotation service with the fake group added.
 *
 * @returns {object} The annotation service, the fake app service
 *   and its draw layer.
 */
function setup() {
  const { service, drawLayer } = getFakeDwvAppService()
  const annotService = new AnnotationService(service)
  annotService.connect()
  service.dispatchEvent(
    new CustomEvent('dataadd', { detail: { dataid: '1' } }))
  return { annotService, service, drawLayer }
}

/**
 * Dispatch a 'tap' event.
 *
 * @param {EventTarget} service The fake app service.
 * @param {object[]} annotations The tapped annotations.
 */
function tap(service, annotations) {
  service.dispatchEvent(new CustomEvent('tap', {
    detail: { position: [0, 0, 0], annotations, segments: [] }
  }))
}

describe('AnnotationService', () => {
  test('goto moves to the annotation and highlights it', () => {
    const { annotService, drawLayer } = setup()
    annotService.gotoAnnotation('1', 'a1')
    expect(drawLayer.setCurrentPosition).toHaveBeenCalledWith({ x: 1, y: 2 })
    expect(drawLayer.highlightAnnotation).toHaveBeenCalledWith('a1')
  })

  test('tap on an annotation selects it', () => {
    const { annotService, service } = setup()
    tap(service, [{ dataid: '1', annotationid: 'a1' }])
    expect(annotService.getSnapshot().selected)
      .toEqual({ dataId: '1', annotationId: 'a1' })
  })

  test('tap outside annotations clears the selection', () => {
    const { annotService, service } = setup()
    annotService.selectAnnotation('1', 'a0')
    tap(service, [])
    expect(annotService.getSnapshot().selected).toBeUndefined()
  })

  test('tap on an unknown annotation clears the selection', () => {
    const { annotService, service } = setup()
    annotService.selectAnnotation('1', 'a0')
    tap(service, [{ dataid: '2', annotationid: 'b0' }])
    expect(annotService.getSnapshot().selected).toBeUndefined()
  })
})
