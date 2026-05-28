import { fromDOMIntersections } from '@johngw/stream/dom/sources/fromDOMIntersections'
import { write } from '@johngw/stream/sinks/write'
import {
  type CallIntersectionObserver,
  boundingClientRect,
  mockIntersectionObserver,
} from '../mocks/IntersectionObserver.ts'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import { happydom, unhappydom } from '../happydom.ts'

describe('fromDOMIntersections', () => {
  let abortController: AbortController
  let callIntersectionObservers: CallIntersectionObserver
  let target: HTMLDivElement
  let unmockIntersectionObserver: () => void

  before(happydom)
  after(unhappydom)

  beforeEach(() => {
    abortController = new AbortController()
    target = document.createElement('div')
    ;({ callIntersectionObservers, unmock: unmockIntersectionObserver } =
      mockIntersectionObserver(window))
  })

  afterEach(() => {
    unmockIntersectionObserver()
    abortController.abort()
  })

  test('receive notification when element is scrolled in to view', async ({
    mock,
    assert,
    signal,
  }) => {
    const fn = mock.fn((_entry: IntersectionObserverEntry) => {})
    const entry = {
      boundingClientRect: boundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: boundingClientRect(),
      isIntersecting: true,
      rootBounds: boundingClientRect(),
      target,
      time: Date.now(),
    }
    const stream = fromDOMIntersections()(target)
    const p = stream
      .pipeTo(write(fn), {
        signal: AbortSignal.any([signal, abortController.signal]),
      })
      .catch(throwUnlessAborted)
    callIntersectionObservers([entry])
    await timeout()
    assert.equal(fn.mock.callCount(), 1)
    assert.equal(fn.mock.calls[0]!.arguments[0], entry)
    abortController.abort()
    await p
  })

  test('only receives notifications of current target', async ({
    assert,
    mock,
    signal,
  }) => {
    const fn = mock.fn((_entry: IntersectionObserverEntry) => {})
    const stream = fromDOMIntersections()(target)
    const p = stream
      .pipeTo(write(fn), {
        signal: AbortSignal.any([signal, abortController.signal]),
      })
      .catch(throwUnlessAborted)
    callIntersectionObservers([
      {
        boundingClientRect: boundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: boundingClientRect(),
        isIntersecting: true,
        rootBounds: boundingClientRect(),
        target: document.createElement('div'),
        time: Date.now(),
      },
    ])
    await timeout()
    assert.equal(fn.mock.callCount(), 0)
    abortController.abort()
    await p
  })

  test('errored streams will remove observers', async ({ assert, mock }) => {
    const fn = mock.fn((_entry: IntersectionObserverEntry) => {})
    const entry = {
      boundingClientRect: boundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: boundingClientRect(),
      isIntersecting: true,
      rootBounds: boundingClientRect(),
      target,
      time: Date.now(),
    }
    const stream = fromDOMIntersections()(target)
    await assert.rejects(
      stream.pipeTo(write(fn), {
        signal: AbortSignal.abort(),
      }),
    )
    callIntersectionObservers([entry])
    await timeout()
    assert.equal(fn.mock.callCount(), 0)
  })
})
