import type { Forkable } from './Forkable.js'
import { ForkableSink } from './ForkableSink.js'

/**
 * Abstract logic for Forkable streams.
 *
 * @group Sinks
 */
export abstract class BaseForkableStream<
  T,
  Sink extends ForkableSink<T> = ForkableSink<T>,
>
  extends WritableStream<T>
  implements Forkable<T>
{
  readonly #sink: Sink

  constructor(sink: Sink, queuingStrategy?: QueuingStrategy<T>) {
    super(sink, queuingStrategy)
    this.#sink = sink
  }

  get finished() {
    return this.#sink.finished
  }

  fork(
    underlyingSource?: UnderlyingDefaultSource<T>,
    queuingStrategy?: QueuingStrategy<T>,
  ) {
    return this.#sink.fork(underlyingSource, queuingStrategy)
  }

  protected get sink() {
    return this.#sink
  }
}
