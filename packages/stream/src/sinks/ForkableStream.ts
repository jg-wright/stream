import { BaseForkableStream } from './BaseForkableStream.js'
import { ForkableSink } from './ForkableSink.js'

/**
 * A ForkableStream is "1 Writable to many Readables".
 *
 * @group Sinks
 * @example
 * ```
 * const forkable = new ForkableStream<T>()
 *
 * fromCollection([1, 2, 3, 4, 5, 6, 7]).pipeTo(forkable)
 *
 * forkable.fork().pipeTo(write(x => console.info('fork1', x)))
 * // fork1 1, fork1 2, fork1 3, fork1 4, fork1 5, fork1 6, fork1 7
 *
 * forkable.fork().pipeTo(write(x => console.info('fork2', x)))
 * // fork2 1, fork2 2, fork2 3, fork2 4, fork2 5, fork2 6, fork2 7
 * ```
 */
export class ForkableStream<T> extends BaseForkableStream<T> {
  constructor(queuingStrategy?: QueuingStrategy<T>) {
    super(new ForkableSink<T>(), queuingStrategy)
  }
}
