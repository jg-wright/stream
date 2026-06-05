import type { Predicate } from '@johngw/stream-common/Function'
import { type Flushable, pipeFlushes } from '@johngw/stream-common/Stream'

/**
 * Runs every chunk through a predicate. If anything suceeds the
 * predicate, `true` is queued and the stream terminated.
 * Otherwise this will wait for the entire stream to finish
 * before queuing `false`.
 *
 * @group Transformers
 * @see {@link every:function}
 * @example
 * When every chunk failes the predicate.
 * ```
 * --1--2--3--4--5--6--7--8--9-|
 *
 * every((x) => x > 10)
 *
 * ----------------------------F-|
 * ```
 *
 * When something passes the predicate.
 * ```
 * --1--2--3--4--5--6--X
 *
 * every((x) => x > 5)
 *
 * -----------------T--|
 * ```
 *
 * A `flushes` stream can be used to force the transformer to queue
 * it's current state downstream.
 *
 * ```
 * --1--2--3--4--5--6--7--8--9-|
 *
 * some((x) => x > 10, { flushes:
 * -----------N-----------------
 * })
 *
 * -----------F----------------F-|
 */
export function some<T>(predicate: Predicate<T>, options?: Flushable) {
  const abortController = new AbortController()

  return new TransformStream<T, boolean>({
    start(controller) {
      pipeFlushes(
        () => controller.enqueue(false),
        (error) => controller.error(error),
        { ...options, signal: abortController.signal },
      )
    },

    async transform(chunk, controller) {
      try {
        if (await predicate(chunk)) {
          controller.enqueue(true)
          controller.terminate()
        }
      } catch (error) {
        controller.error(error)
      }
    },

    flush(controller) {
      controller.enqueue(false)
      abortController.abort()
    },

    cancel() {
      abortController.abort()
    },
  })
}
