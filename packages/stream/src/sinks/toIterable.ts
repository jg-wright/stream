import { toIterator, type ToIteratorOptions } from './toIterator.js'

/**
 * Turns a `ReadableStream` in to an `AsyncIterable`.
 *
 * @group Sinks
 * @see {@link toArray:function}
 * @see {@link toIterator}
 * @example
 * ```
 * for await (const chunk of toIterable(stream)) {
 *
 * }
 * ```
 */
export function toIterable<T>(
  stream: ReadableStream<T>,
  options?: ToIteratorOptions,
): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: () => toIterator(stream, options),
  }
}
