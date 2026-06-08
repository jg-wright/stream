/**
 * Consume chunks from a ReadableStream. Syntactical sugar
 * for a simple WritableStream.
 *
 * @group Sinks
 * @example
 * ```
 * readableStream.pipeTo(write(console.info))
 *
 * // ... instead of ...
 *
 * readableStream.pipeTo(new WritableStream({
 *   write(chunk) {
 *     console.info(chunk)
 *   }
 * }))
 * ```
 */
export function write<T>(
  fn?: (chunk: T) => unknown,
  queuingStrategy?: QueuingStrategy<T>,
) {
  return new WritableStream<T>(
    fn && {
      async write(chunk) {
        await fn(chunk)
      },
    },
    queuingStrategy,
  )
}
