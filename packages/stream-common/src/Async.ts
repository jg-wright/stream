/**
 * Applies a callback to each item of `array` and wraps
 * the result in a `Promise.all`.
 *
 * @group Utils
 * @category Async
 * @example
 * ```
 * await all(sinks, sink => sink.close())
 * // :this: is syntactical sugar for:
 * await Promise.all(sinks.map(sink => sink.close()))
 * ```
 */
export function all<T>(
  array: T[],
  map: (item: T, index: number, array: T[]) => unknown,
) {
  return Promise.all(array.map(map))
}

/**
 * Returns a promise that resolves in `ms` milliseconds.
 *
 * @group Utils
 * @category Async
 */
export function timeout(ms?: number): Promise<void>

export function timeout<T>(
  ms: number,
  value: T,
  signal?: AbortSignal,
): Promise<T>

export function timeout<T>(ms?: number, value?: T, signal?: AbortSignal) {
  return new Promise<T | void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)

    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }

    const timer = setTimeout(
      (x) => {
        signal?.removeEventListener('abort', onAbort)
        resolve(x)
      },
      ms,
      value,
    )

    signal?.addEventListener('abort', onAbort)
  })
}

/**
 * Returns a promise and a way to resolve or reject it.
 *
 * @group Utils
 * @category Async
 */
export function defer<T = void>() {
  let $resolve: (value: T | PromiseLike<T>) => void
  let $reject: (reason?: unknown) => void

  return {
    promise: new Promise<T>((resolve, reject) => {
      $resolve = resolve
      $reject = reject
    }),
    resolve: $resolve!,
    reject: $reject!,
  }
}
