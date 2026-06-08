/**
 * Streams the latest chunk in intervals of `ms`.
 *
 * @group Transformers
 * @example
 * ```
 * --1--T40----2--T20--|
 * sampleTime(20)
 * -T20-1-T20-1-T20-2--|
 * ```
 */
export function sampleTime<T>(ms: number): TransformStream<T, T> {
  let buffer: T
  let interval: NodeJS.Timeout
  let hasSample = false

  return new TransformStream({
    start(controller) {
      interval = setInterval(() => {
        if (hasSample) controller.enqueue(buffer)
      }, ms)
    },

    transform(chunk) {
      hasSample = true
      buffer = chunk
    },

    flush() {
      clearInterval(interval)
    },

    cancel() {
      clearInterval(interval)
    },
  })
}
