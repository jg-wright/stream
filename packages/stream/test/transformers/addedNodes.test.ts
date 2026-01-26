import { fromDOMMutations } from '@johngw/stream/sources/fromDOMMutations'
import { addedNodes } from '@johngw/stream/transformers/addedNodes'
import { write } from '@johngw/stream/sinks/write'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  mock,
  test,
  describe,
} from 'bun:test'
import { JSDOM } from 'jsdom'

describe('addedNodes', () => {
  let abortController: AbortController
  let dom: JSDOM
  let original: typeof MutationObserver

  beforeAll(() => {
    dom = new JSDOM()
    original = global.MutationObserver
    global.MutationObserver = dom.window.MutationObserver
  })

  beforeEach(() => {
    abortController = new AbortController()
  })

  afterEach(() => {
    abortController.abort()
  })

  afterAll(() => {
    global.MutationObserver = original
  })

  test('picks added nodes from DOM mutations', async () => {
    const fn = mock()
    const { document } = dom.window

    fromDOMMutations(
      document.body,
      { childList: true },
      new CountQueuingStrategy({ highWaterMark: 2 }),
    )
      .pipeThrough(addedNodes())
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)

    const p = document.createElement('p')
    p.classList.add('test')
    document.body.appendChild(p)

    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)

    const div = document.createElement('div')
    div.appendChild(p)
    document.body.appendChild(div)

    await timeout()
    expect(fn).toHaveBeenCalledTimes(2)

    expect(fn.mock.calls[0]![0].outerHTML).toMatchInlineSnapshot(
      `"<p class="test"></p>"`,
    )

    expect(fn.mock.calls[1]![0].outerHTML).toMatchInlineSnapshot(
      `"<div><p class="test"></p></div>"`,
    )
  })
})
