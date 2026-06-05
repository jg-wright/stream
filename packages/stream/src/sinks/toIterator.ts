import type { ReadableStreamDefaultReader } from 'node:stream/web'
/**
 * Options for {@link toIterator}.
 *
 * @group Sinks
 */
export interface ToIteratorOptions {
  signal: AbortSignal
}

/**
 * Turns a `ReadableStream` in to an `AsyncIterator`.
 *
 * @group Sinks
 * @see {@link toIterable:function}
 * @example
 * ```
 * const iterator = toIterator(stream)
 * while (true) {
 *   const result = await iterator.next()
 *   if (result.done) break
 *   doSomething(result.value)
 * }
 * ```
 */
export function toIterator<T>(
  stream: ReadableStream<T>,
  options?: ToIteratorOptions
): AsyncIterator<T> {
  return new StreamIterator(stream, options?.signal)
}

class StreamIterator<T> implements AsyncIterator<T> {
  #reader: ReadableStreamDefaultReader<T>
  #signal?: AbortSignal

  constructor(stream: ReadableStream<T>, signal?: AbortSignal) {
    this.#reader = stream.getReader()
    this.#signal = signal
    if (signal?.aborted) this.throw(signal.reason)
    signal?.addEventListener('abort', () => this.throw(signal.reason))
  }

  next() {
    return this.#signal?.aborted
      ? Promise.reject(this.#signal.reason)
      : (this.#reader.read() as Promise<IteratorResult<T>>)
  }

  async return(value: T): Promise<IteratorResult<T>> {
    try {
      await this.#reader.cancel()
    } catch (error) {
      // potentially already closed
    }
    return { done: true, value }
  }

  async throw(reason?: unknown): Promise<IteratorResult<T>> {
    try {
      await this.#reader.cancel(reason)
    } catch (error) {
      // potentially already closed
    }
    return { done: true, value: undefined }
  }
}
