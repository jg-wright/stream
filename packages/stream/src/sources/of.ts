/**
 * Creates a ReadableStream the queues `x` and closes.
 *
 * @group Sources
 * @example
 * ```
 * await of({ foo: 'bar' }).pipeTo(write(x => console.info(x)))
 * // { foo: 'bar' }
 * ```
 */
export function of<T>(x: T) {
  return new ReadableStream<T>({
    pull(controller) {
      controller.enqueue(x)
      controller.close()
    },
  })
}
