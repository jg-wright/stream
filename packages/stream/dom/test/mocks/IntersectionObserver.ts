import { mock, type Mock } from 'node:test'

export type IntersectionObserverMock = Mock<
  (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) => IntersectionObserver
>

export type CallIntersectionObserver = (
  entries: IntersectionObserverEntry[],
) => unknown

export function mockIntersectionObserver(
  window: Pick<typeof globalThis, 'IntersectionObserver'>,
) {
  const OriginalIntersectionObserver = window.IntersectionObserver

  const instanceSet = new Set<IntersectionObserver>()

  const callbacks = new WeakMap<
    IntersectionObserver,
    IntersectionObserverCallback
  >()

  const IntersectionObserverMock: IntersectionObserverMock =
    (window.IntersectionObserver = mock.fn(function (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ): IntersectionObserver {
      const observer = {
        observe: mock.fn((_target: Element) => {}),
        unobserve: mock.fn((_target: Element) => {}),
        root: options?.root || document,
        rootMargin: options?.rootMargin
          ? typeof options.rootMargin === 'number'
            ? `${options.rootMargin}px`
            : options.rootMargin
          : '0px',
        thresholds: Array.isArray(options?.threshold)
          ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            options!.threshold
          : typeof options?.threshold === 'number'
            ? [options.threshold]
            : [0],
        disconnect: mock.fn(() => {}),
        scrollMargin: '0px',
        takeRecords: mock.fn((): IntersectionObserverEntry[] => []),
      }

      instanceSet.add(observer)
      callbacks.set(observer, callback)

      return observer
    }) as any)

  return {
    IntersectionObserverMock,
    unmock() {
      window.IntersectionObserver = OriginalIntersectionObserver
      instanceSet.clear()
    },
    callIntersectionObservers(entries: IntersectionObserverEntry[]) {
      for (const instance of instanceSet) {
        const callback = callbacks.get(instance)
        callback?.(entries, instance)
      }
    },
  }
}

export function boundingClientRect({
  bottom = 1,
  height = 1,
  left = 1,
  right = 1,
  top = 1,
  width = 1,
  x = left,
  y = top,
}: Partial<DOMRectReadOnly> = {}): DOMRectReadOnly {
  const rect = {
    bottom,
    height,
    left,
    right,
    top,
    width,
    x,
    y,
  }
  return {
    ...rect,
    toJSON: () => JSON.stringify(rect),
  }
}
