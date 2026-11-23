import { describe, expect, test, vi } from 'vitest'

// record the urls passed to the dwv app load
const { loadedUrls } = vi.hoisted(() => ({ loadedUrls: [] }))
vi.mock('dwv', async (importOriginal) => {
  const dwv = await importOriginal()
  class App extends dwv.App {
    loadURLs = (urls) => {
      loadedUrls.push(urls)
      return '0'
    }
  }
  return { ...dwv, App }
})

import { DwvAppService } from './dwvAppService.js'

describe('DwvAppService', () => {
  test('loadFromUri loads the urls of the input query', () => {
    loadedUrls.length = 0
    const service = new DwvAppService('viewer0')

    // single input
    service.loadFromUri('https://host/?input=' +
      encodeURIComponent('https://data/a.dcm'))
    // key-value input
    service.loadFromUri('https://host/?input=' +
      encodeURIComponent('https://data/?id=b&id=c'))
    // no input: nothing loaded
    service.loadFromUri('https://host/?other=d')
    service.loadFromUri('https://host/')

    expect(loadedUrls).toEqual([
      ['https://data/a.dcm'],
      ['https://data/?id=b', 'https://data/?id=c']
    ])
    service.dispose()
  })
})
