/**
 * Queues the first item it receives then terminates the stream.
 *
 * @group Transformers
 * @example
 * ```
 * --1--X
 *
 * first()
 *
 * --1--|
 * ```
 */
export function first<T>() {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      controller.enqueue(chunk)
      controller.terminate()
    },
  })
}
