import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { fromDOMMutations } from '@johngw/stream/sources/fromDOMMutations'
import { removedNodes } from '@johngw/stream/transformers/removedNodes'
import { write } from '@johngw/stream/sinks/write'
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

describe('removedNodes', () => {
  let abortController: AbortController
  let dom: JSDOM
  let original: typeof MutationObserver

  beforeAll(() => {
    dom = new JSDOM()
    original = global.MutationObserver
    global.MutationObserver = dom.window.MutationObserver
  })

  afterAll(() => {
    global.MutationObserver = original
  })

  beforeEach(() => {
    abortController = new AbortController()
  })

  afterEach(() => {
    abortController.abort()
  })

  test('picks removed nodes from DOM mutations', async () => {
    const { document } = dom.window
    const fn = mock()

    fromDOMMutations(document.body, { childList: true })
      .pipeThrough(removedNodes())
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)

    const p = document.createElement('p')
    p.classList.add('test')
    document.body.appendChild(p)

    await timeout()

    const div = document.createElement('div')
    div.appendChild(p)

    await timeout()

    document.body.appendChild(div)

    await timeout()

    expect(fn.mock.calls[0]![0]!.outerHTML).toMatchInlineSnapshot(
      `"<p class="test"></p>"`,
    )
  })
})
