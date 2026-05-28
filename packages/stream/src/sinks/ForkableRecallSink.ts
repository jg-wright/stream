import { empty, type Empty } from '@johngw/stream-common/Symbol'
import { ForkableSink } from './ForkableSink.js'
import { ControllableSource } from '../sources/ControllableSource.js'
import type { UnderlyingDefaultSource } from 'node:stream/web'

/**
 * An extension to the {@link ForkableSink:class} that immediately
 * queues the last received chunk to any fork.
 *
 * @group Sinks
 * @see {@link ForkableRecallStream:class}
 * @example
 * ```
 * const forkable = new ForkableRecallSink<number>()
 * const writable = new WritableStream(forkable)
 * await fromCollection([1, 2, 3, 4, 5, 6, 7]).pipeTo(writable)
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
export class ForkableRecallSink<T> extends ForkableSink<T> {
  #chunk: T | Empty = empty

  override write(chunk: T) {
    this.#chunk = chunk
    return super.write(chunk)
  }

  protected override _addController(
    underlyingSource?: UnderlyingDefaultSource<T>,
    queuingStrategy?: QueuingStrategy<T>,
  ): readonly [ControllableSource<T>, ReadableStream<T>] {
    const [controller, stream] = super._addController(
      underlyingSource,
      queuingStrategy,
    )
    if (this.#chunk !== empty) controller.enqueue(this.#chunk)
    return [controller, stream]
  }
}
