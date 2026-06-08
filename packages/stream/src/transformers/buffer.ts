import { write } from '@johngw/stream-common/Stream'

/**
 * Buffers the source stream chunks until `notifier` emits.
 *
 * @group Transformers
 * @example
 * ```
 * --a--b--c--d--e--f--g--h--i--|
 *
 * buffer(
 * --------B--------B--------B--|
 * )
 *
 * --------[a,b,c]--[d,e,f]--[g,h,i]-|
 * ```
 */
export function buffer<T>(
  notifier: ReadableStream<unknown>,
  maxBuffer = Number.MAX_SAFE_INTEGER,
) {
  const abortController = new AbortController()
  let buffer: T[] = []

  return new TransformStream<T, T[]>({
    start(controller) {
      notifier
        .pipeTo(
          write(() => {
            if (buffer.length) {
              controller.enqueue(buffer)
              buffer = []
            }
          }),
          { signal: abortController.signal },
        )
        .then(() =>
          // Typescript still thinks that `flush` may not be set.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.flush!(controller),
        )
        .catch((error) => controller.error(error))
    },

    transform(chunk: T) {
      if (buffer.length === maxBuffer) buffer.shift()
      buffer.push(chunk)
    },

    flush(controller) {
      if (buffer.length) controller.enqueue(buffer)
      controller.terminate()
      abortController.abort()
    },

    cancel() {
      abortController.abort()
    },
  })
}
