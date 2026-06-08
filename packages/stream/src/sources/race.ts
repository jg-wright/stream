import { all } from '@johngw/stream-common/Async'
import { immediatelyClosingReadableStream } from '@johngw/stream-common/Stream'

/**
 * Returns a `ReadableStream` that mirrors the first source stream to queue an item.
 *
 * @group Sources
 * @example
 * ```
 * race([
 * ----20----40----60------
 * --1-----2-----3---------
 * -----------0-----0----0-
 * ])
 *
 * --1-----2-----3---------
 * ```
 */
export function race<T>(
  streams: ReadableStream<T>[],
  queuingStrategy?: QueuingStrategy<T>,
) {
  if (!streams.length) return immediatelyClosingReadableStream()

  const readers = streams.map((stream) => stream.getReader())

  return new ReadableStream<T>(
    {
      async pull(controller) {
        return Promise.race(readers.map((reader) => reader.read())).then(
          (result) =>
            result.done ? controller.close() : controller.enqueue(result.value),
          (error) => controller.error(error),
        )
      },

      async cancel(reason) {
        await all(readers, (reader) => reader.cancel(reason))
      },
    },
    queuingStrategy,
  )
}
