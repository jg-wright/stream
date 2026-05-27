import { fromDOMMutations } from '@johngw/stream/sources/fromDOMMutations'
import { write } from '@johngw/stream/sinks/write'
import { isAbortError, timeout } from '@johngw/stream-common'
import { after, before, describe, test } from 'node:test'
import { Window } from 'happy-dom'

let abortController: AbortController
let window: Window
let original: typeof MutationObserver

before(() => {
  abortController = new AbortController()
  window = new Window()
  original = global.MutationObserver
  global.MutationObserver =
    window.MutationObserver as unknown as typeof MutationObserver
})

after(() => {
  global.MutationObserver = original
  abortController.abort()
})

describe('fromDOMMutations', () => {
  test('stream of DOM mutations', async ({ assert, mock }) => {
    const fn = mock.fn()
    const { document } = window

    fromDOMMutations(document.body as never, {
      childList: true,
    })
      .pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            controller.enqueue({
              added: chunk.addedNodes,
              removed: chunk.removedNodes,
            })
          },
        }),
      )
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch((error) => {
        if (!isAbortError(error)) throw error
      })

    const p = document.createElement('p')
    p.classList.add('test')
    document.body.appendChild(p)

    await timeout()

    const div = document.createElement('div')
    div.appendChild(p)

    await timeout()

    document.body.appendChild(div)

    await timeout()

    assert.equal(fn.mock.callCount(), 3)

    assert.equal(fn.mock.calls[0]!.arguments[0]!.added.length, 1)
    assert.equal(fn.mock.calls[0]!.arguments[0]!.removed.length, 0)
    assert.snapshot(fn.mock.calls[0]!.arguments[0]!.added[0].outerHTML)

    assert.equal(fn.mock.calls[1]!.arguments[0]!.added.length, 0)
    assert.equal(fn.mock.calls[1]!.arguments[0]!.removed.length, 1)
    assert.snapshot(fn.mock.calls[1]!.arguments[0]!.removed[0].outerHTML)

    assert.equal(fn.mock.calls[2]!.arguments[0]!.added.length, 1)
    assert.equal(fn.mock.calls[2]!.arguments[0]!.removed.length, 0)
    assert.snapshot(fn.mock.calls[2]!.arguments[0]!.added[0].outerHTML)
  })

  test('cancelling the stream will disconnect the observer', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    const { document } = window

    fromDOMMutations(document.body as never, { childList: true })
      .pipeTo(write(fn), { signal: AbortSignal.abort() })
      .catch(() => {
        //
      })

    const p = document.createElement('p')
    p.classList.add('test')
    document.body.appendChild(p)

    await timeout()

    assert.equal(fn.mock.callCount(), 0)
  })
})
