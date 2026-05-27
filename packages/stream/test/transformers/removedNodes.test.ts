import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { fromDOMMutations } from '@johngw/stream/sources/fromDOMMutations'
import { removedNodes } from '@johngw/stream/transformers/removedNodes'
import { write } from '@johngw/stream/sinks/write'
import { after, afterEach, before, beforeEach, test, describe } from 'node:test'
import { Window } from 'happy-dom'

describe('removedNodes', () => {
  let abortController: AbortController
  let window: Window
  let original: typeof MutationObserver

  before(() => {
    window = new Window()
    original = global.MutationObserver
    global.MutationObserver =
      window.MutationObserver as unknown as typeof MutationObserver
  })

  after(() => {
    global.MutationObserver = original
  })

  beforeEach(() => {
    abortController = new AbortController()
  })

  afterEach(() => {
    abortController.abort()
  })

  test('picks removed nodes from DOM mutations', async ({ assert, mock }) => {
    const { document } = window
    const fn = mock.fn()

    fromDOMMutations(document.body as never, { childList: true })
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

    assert.snapshot(fn.mock.calls[0]!.arguments[0]!.outerHTML)
  })
})
