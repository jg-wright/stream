import type { UnderlyingSource } from 'bun'

/**
 * A common interface for forkable streams.
 *
 * @group Sinks
 */
export interface Forkable<T> {
  finished: boolean

  fork(
    underlyingSource?: UnderlyingSource<T>,
    queuingStrategy?: QueuingStrategy<T>
  ): ReadableStream<T>
}
