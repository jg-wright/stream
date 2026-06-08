import { fromDOMMutations } from '@johngw/stream/dom/sources/fromDOMMutations'
import { addedNodes } from '@johngw/stream/dom/transformers/addedNodes'
import { write } from '@johngw/stream/sinks/write'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { after, afterEach, before, beforeEach, test, describe } from 'node:test'
import { Window } from 'happy-dom'

describe('addedNodes', () => {
  let abortController: AbortController
  let window: Window
  let original: typeof MutationObserver

  before(() => {
    window = new Window()
    original = global.MutationObserver
    global.MutationObserver =
      window.MutationObserver as unknown as typeof MutationObserver
  })

  beforeEach(() => {
    abortController = new AbortController()
  })

  afterEach(() => {
    abortController.abort()
  })

  after(() => {
    global.MutationObserver = original
  })

  test('picks added nodes from DOM mutations', async ({ assert, mock }) => {
    const fn = mock.fn()
    const { document } = window

    fromDOMMutations(
      document.body as never,
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
    assert.equal(fn.mock.callCount(), 1)

    const div = document.createElement('div')
    div.appendChild(p)
    document.body.appendChild(div)

    await timeout()
    assert.equal(fn.mock.callCount(), 2)

    assert.snapshot(fn.mock.calls[0]!.arguments[0].outerHTML)

    assert.snapshot(fn.mock.calls[1]!.arguments[0].outerHTML)
  })
})
