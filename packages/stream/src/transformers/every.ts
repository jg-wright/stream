import type { Predicate } from '@johngw/stream-common/Function'
import { type Flushable, pipeFlushes } from '@johngw/stream-common/Stream'

/**
 * Runs every chunk through a predicate. If anything fails the
 * predicate, `false` is queued and the stream terminated.
 * Otherwise this will wait for the entire stream to finish
 * before queuing `true`.
 *
 * @group Transformers
 * @see {@link some:function}
 * @example
 * When every chunk passes the predicate.
 * ```
 * --1--2--3--4--5--6--7--8--9-|
 *
 * every((x) => x < 10)
 *
 * ----------------------------T-|
 * ```
 *
 * When something fails the predicate.
 * ```
 * --1--2--3--4--5--6--X
 *
 * every((x) => x < 5)
 *
 * ------------------F-|
 * ```
 *
 * A `flushes` stream can be used to force the transformer to queue
 * it's current state downstream.
 *
 * ```
 * --1--2--3--4--5--6--7--8--9-|
 *
 * every((x) => x < 10, { flushes:
 * -----------N-----------------
 * })
 *
 * -----------T----------------T-|
 * ```
 */
export function every<T>(predicate: Predicate<T>, options?: Flushable) {
  const finishController = new AbortController()

  return new TransformStream<T, boolean>({
    start(controller) {
      pipeFlushes(
        () => controller.enqueue(true),
        (error) => controller.error(error),
        { ...options, signal: finishController.signal },
      )
    },

    async transform(chunk, controller) {
      try {
        if (!(await predicate(chunk))) {
          controller.enqueue(false)
          controller.terminate()
        }
      } catch (error) {
        controller.error(error)
      }
    },

    flush(controller) {
      controller.enqueue(true)
      finishController.abort()
    },

    cancel() {
      finishController.abort()
    },
  })
}
