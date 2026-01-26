/// <reference lib="dom" />

import { fromDOMIntersections } from '@johngw/stream/sources/fromDOMIntersections'
import { write } from '@johngw/stream/sinks/write'
import {
  type CallIntersectionObserver,
  type IntersectionObserverMock,
  boundingClientRect,
  mockIntersectionObserver,
} from '../mocks/IntersectionObserver'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from 'bun:test'
import { happydom, unhappydom } from '../happydom'

describe('fromDOMIntersections', () => {
  let abortController: AbortController
  let callIntersectionObservers: CallIntersectionObserver
  let IntersectionObserverMock: IntersectionObserverMock
  let target: HTMLDivElement
  let unmockIntersectionObserver: () => void

  beforeAll(happydom)
  afterAll(unhappydom)

  beforeEach(() => {
    abortController = new AbortController()
    target = document.createElement('div')
    ;({
      callIntersectionObservers,
      // oxlint-disable-next-line no-import-assign
      IntersectionObserverMock,
      unmock: unmockIntersectionObserver,
    } = mockIntersectionObserver(window))
  })

  afterEach(() => {
    unmockIntersectionObserver()
    abortController.abort()
  })

  test('receive notification when element is scrolled in to view', async () => {
    const fn = mock((_entry: IntersectionObserverEntry) => {})
    const entry = {
      boundingClientRect: boundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: boundingClientRect(),
      isIntersecting: true,
      rootBounds: boundingClientRect(),
      target,
      time: Date.now(),
    }
    fromDOMIntersections()(target)
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)
    callIntersectionObservers([entry])
    await timeout()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.calls[0]![0]).toBe(entry)
  })

  test('only receives notifications of current target', async () => {
    const fn = mock((_entry: IntersectionObserverEntry) => {})
    fromDOMIntersections()(target)
      .pipeTo(write(fn), { signal: abortController.signal })
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
    expect(fn).not.toHaveBeenCalled()
  })

  test('errored streams will remove observers', async () => {
    const fn = mock((_entry: IntersectionObserverEntry) => {})
    const entry = {
      boundingClientRect: boundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: boundingClientRect(),
      isIntersecting: true,
      rootBounds: boundingClientRect(),
      target,
      time: Date.now(),
    }
    await expect(
      fromDOMIntersections()(target).pipeTo(write(fn), {
        signal: AbortSignal.abort(),
      }),
    ).rejects.toThrow()
    callIntersectionObservers([entry])
    await timeout()
    expect(fn).not.toHaveBeenCalled()
  })
})
