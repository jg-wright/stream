import type { Clearable } from '../types/Clearable.js'
import { ForkableSink } from '../sinks/ForkableSink.js'
import { ControllableSource } from '../sources/ControllableSource.js'
import type { UnderlyingDefaultSource } from 'node:stream/web'

/**
 * An extension to the {@link ForkableSink:class} that immediately
 * queues the entire contents of whatever has been previously consumed.
 *
 * @group Sinks
 * @see {@link ForkableReplayStream:class}
 * @example
 * ```
 * const forkable = new ForkableReplaySink<number>()
 * const writable = new WritableStream(forkable)
 * await fromCollection([1, 2, 3, 4, 5, 6, 7]).pipeTo(writable)
 * ```
 *
 * Now the stream has finished, if we fork from it we'll
 * receive the entire events that were published to it.
 *
 * ```
 * await forkable.fork().pipeTo(write(console.info))
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // 7
 * ```
 */
export class ForkableReplaySink<T>
  extends ForkableSink<T>
  implements Clearable
{
  #chunks: T[] = []
  #maxReplaySize

  constructor(maxReplaySize = Number.MAX_SAFE_INTEGER) {
    super()
    this.#maxReplaySize = maxReplaySize
  }

  override write(chunk: T) {
    if (this.#chunks.length === this.#maxReplaySize) this.#chunks.shift()
    this.#chunks.push(chunk)
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
    for (const chunk of this.#chunks) controller.enqueue(chunk)
    return [controller, stream]
  }

  clear() {
    this.#chunks = []
  }
}
