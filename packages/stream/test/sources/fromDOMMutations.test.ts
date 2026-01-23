import { fromDOMMutations } from '@johngw/stream/sources/fromDOMMutations'
import { write } from '@johngw/stream/sinks/write'
import { isAbortError, timeout } from '@johngw/stream-common'
import { afterAll, beforeAll, expect, mock, test } from 'bun:test'
import { JSDOM } from 'jsdom'

let abortController: AbortController
let dom: JSDOM
let original: typeof MutationObserver

beforeAll(() => {
  abortController = new AbortController()
  dom = new JSDOM()
  original = global.MutationObserver
  global.MutationObserver = dom.window.MutationObserver
})

afterAll(() => {
  global.MutationObserver = original
  abortController.abort()
})

test('stream of DOM mutations', async () => {
  const fn = mock()
  const { document } = dom.window

  fromDOMMutations(document.body, {
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
      })
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

  expect(fn).toHaveBeenCalledTimes(3)

  expect(fn.mock.calls[0]![0]!.added).toHaveLength(1)
  expect(fn.mock.calls[0]![0]!.removed).toHaveLength(0)
  expect(fn.mock.calls[0]![0]!.added[0].outerHTML).toMatchInlineSnapshot(
    `"<p class="test"></p>"`
  )

  expect(fn.mock.calls[1]![0]!.added).toHaveLength(0)
  expect(fn.mock.calls[1]![0]!.removed).toHaveLength(1)
  expect(fn.mock.calls[1]![0]!.removed[0].outerHTML).toMatchInlineSnapshot(
    `"<p class="test"></p>"`
  )

  expect(fn.mock.calls[2]![0]!.added).toHaveLength(1)
  expect(fn.mock.calls[2]![0]!.removed).toHaveLength(0)
  expect(fn.mock.calls[2]![0]!.added[0].outerHTML).toMatchInlineSnapshot(
    `"<div><p class="test"></p></div>"`
  )
})

test('cancelling the stream will disconnect the observer', async () => {
  const fn = mock()
  const { document } = dom.window

  fromDOMMutations(document.body, { childList: true })
    .pipeTo(write(fn), { signal: AbortSignal.abort() })
    .catch(() => {
      //
    })

  const p = document.createElement('p')
  p.classList.add('test')
  document.body.appendChild(p)

  await timeout()

  expect(fn).not.toHaveBeenCalled()
})
