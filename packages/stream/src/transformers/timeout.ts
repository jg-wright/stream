/**
 * Makes sure that events are emitted within `ms`.
 * Otherwise emits an error.
 *
 * @group Transformers
 * @throws {@link TimeoutError}
 * @example
 * readableStream
 *   .pipeThrough(timeout(1_000))
 *   .pipeTo(write())
 *   .catch(error => {
 *     // error is TimeoutError if any event took too long
 *   })
 */
export function timeout<T>(ms: number) {
  let timer: number | NodeJS.Timeout

  return new TransformStream<T, T>({
    start: (controller) => {
      begin(controller)
    },

    transform(chunk, controller) {
      begin(controller)
      controller.enqueue(chunk)
    },

    flush() {
      clearTimeout(timer)
    },

    cancel() {
      clearTimeout(timer)
    },
  })

  function begin(controller: TransformStreamDefaultController<T>) {
    clearTimeout(timer)
    timer = setTimeout(() => controller.error(new TimeoutError(ms)), ms)
  }
}

/**
 * The error emitted from {@link timeout}.
 *
 * @group Transformers
 */
export class TimeoutError extends Error {
  constructor(public readonly ms: number) {
    super(`Exceeded ${ms}ms`)
  }
}
