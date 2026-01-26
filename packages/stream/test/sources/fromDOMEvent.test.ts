import { fromDOMEvent } from '@johngw/stream/sources/fromDOMEvent'
import { write } from '@johngw/stream/sinks/write'
import { first } from '@johngw/stream/transformers/first'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from 'bun:test'
import { JSDOM } from 'jsdom'
import { throwUnlessAborted } from '@johngw/stream-common'

describe('fromDOMEvent', () => {
  let abortController: AbortController
  let dom: JSDOM
  let element: HTMLAnchorElement

  beforeAll(() => {
    dom = new JSDOM()
  })

  beforeEach(() => {
    abortController = new AbortController()
    element = dom.window.document.createElement('a')
    dom.window.document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    abortController.abort()
  })

  test('click events', async () => {
    const fn = mock()

    const finished = fromDOMEvent(element, 'click')
      .pipeThrough(first())
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)

    element.click()

    await finished

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.calls[0]![0]).toBeInstanceOf(dom.window.MouseEvent)
  })
})
