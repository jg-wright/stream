import { fromDOMEvent } from '@johngw/stream/dom/sources/fromDOMEvent'
import { write } from '@johngw/stream/sinks/write'
import { first } from '@johngw/stream/transformers/first'
import { afterEach, before, beforeEach, describe, test } from 'node:test'
import { Window } from 'happy-dom'
import { throwUnlessAborted } from '@johngw/stream-common'

describe('fromDOMEvent', () => {
  let abortController: AbortController
  let window: Window
  let element: HTMLAnchorElement

  before(() => {
    window = new Window()
  })

  beforeEach(() => {
    abortController = new AbortController()
    element = window.document.createElement('a') as unknown as HTMLAnchorElement
    window.document.body.appendChild(element as never)
  })

  afterEach(() => {
    element.remove()
    abortController.abort()
  })

  test('click events', async ({ assert, mock }) => {
    const fn = mock.fn()

    const finished = fromDOMEvent(element, 'click')
      .pipeThrough(first())
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)

    element.click()

    await finished

    assert.equal(fn.mock.callCount(), 1)
    assert.equal(
      fn.mock.calls[0]!.arguments[0] instanceof window.MouseEvent,
      true,
    )
  })
})
