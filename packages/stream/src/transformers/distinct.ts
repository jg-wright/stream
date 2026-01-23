import { type Flushable, pipeFlushes } from '@johngw/stream-common/Stream'

/**
 * Options for the {@link distinct} transformer.
 *
 * @group Transformers
 */
export interface DistinctOptions<T, K> extends Flushable {
  selector?: (value: T) => K
}

/**
 * A TransformStream that queues all items from a ReadableStream that are distinct by comparison from previous items.
 *
 * If a `selector` function is provided, then it will project each value from the source observable into a new value that it will
 * check for equality with previously projected values. If the `selector` function is not provided, it will use each value from the
 * source observable directly with an equality check against previous values.
 *
 * A long-running `distinct` use might result in memory leaks. To help alleviate this in some scenarios, an optional `flushes` parameter
 * is also provided so that the internal `Set` can be "flushed", basically clearing it of values.
 *
 * @group Transformers
 * @example
 * A simple example with numbers
 *
 * ```
 * --1--1--2--2--2--1--2--3--4--3--2--1--
 *
 * distinct()
 *
 * --1-----2--------------3--4-----------
 * ```
 *
 * An example using the `selector` function
 *
 * ```
 * --{a:4,n:'f'}--{a:7,n:'b'}--{a:5,n:'f'}--
 *
 * distinct({ selector: ({ n }) => n })
 *
 * --{a:4,n:'f'}--{a:7,n:'b'}---------------
 * ```
 *
 * An example using the `flushes` parameter.
 *
 * ```
 * --1--1--2--2--2--1--2--3--4--3--2--1--
 *
 * distinct({
 * flushes:
 * -------------F------------------------
 * })
 *
 * --1-----2-----2--1-----3--4-----------
 * ```
 */
export function distinct<T, K>({
  flushes,
  ignoreFlushErrors,
  selector,
}: DistinctOptions<T, K> = {}) {
  const set = new Set<T | K>()
  const finishAbortController = new AbortController()
  const flushesAbortController = new AbortController()

  pipeFlushes(
    () => set.clear(),
    (error) => flushesAbortController.abort(error),
    { flushes, ignoreFlushErrors, signal: finishAbortController.signal }
  )

  return new TransformStream<T, T>({
    start:
      flushes && !ignoreFlushErrors
        ? (controller) => {
            flushesAbortController.signal.addEventListener('abort', () => {
              set.clear()
              controller.error(flushesAbortController.signal.reason)
            })
          }
        : () => {},

    transform(chunk, controller) {
      const key = selector ? selector(chunk) : chunk
      if (!set.has(key)) {
        set.add(key)
        controller.enqueue(chunk)
      }
    },

    flush() {
      set.clear()
      finishAbortController.abort()
    },
  })
}
