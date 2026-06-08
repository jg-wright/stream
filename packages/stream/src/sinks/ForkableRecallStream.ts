import { ForkableStream } from './ForkableStream.js'
import { ForkableRecallSink } from './ForkableRecallSink.js'
import { BaseForkableStream } from './BaseForkableStream.js'

/**
 * An extension to the {@link ForkableStream:class} that immediately
 * queues the last received chunk to any fork.
 *
 * @group Sinks
 * @see {@link ForkableRecallSink}
 * @example
 * ```
 * const forkable = new ForkableRecallStream<number>()
 * await fromCollection([1, 2, 3, 4, 5, 6, 7]).pipeTo(forkable)
 * ```
 *
 * Now the stream has finished, if we fork from it we'll
 * receive the last thing that was emitted.
 *
 * ```
 * await forkable.fork().pipeTo(write(console.info))
 * // 7
 * ```
 */
export class ForkableRecallStream<T> extends BaseForkableStream<
  T,
  ForkableRecallSink<T>
> {
  constructor(strategy?: QueuingStrategy<T>) {
    super(new ForkableRecallSink<T>(), strategy)
  }
}
