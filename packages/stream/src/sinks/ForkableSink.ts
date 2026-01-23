import type { Forkable } from './Forkable.js'
import type { Controllable } from '../sources/Controllable.js'
import { ControllableSource } from '../sources/ControllableSource.js'
import { SourceComposite } from '../sources/SourceComposite.js'
import type { UnderlyingSink, UnderlyingSource } from 'bun'

/**
 * A ForkableSink is the underlying logic for "1 Writable to many Readables".
 *
 * @group Sinks
 * @see {@link ForkableStream:class}
 * @example
 * ```
 * const forkable = new ForkableStream<T>()
 * const writable = new WritableStream(forkable)
 *
 * fromCollection([1, 2, 3, 4, 5, 6, 7]).pipeTo(writable)
 *
 * forkable.fork().pipeTo(write(x => console.info('fork1', x)))
 * // fork1 1, fork1 2, fork1 3, fork1 4, fork1 5, fork1 6, fork1 7
 *
 * forkable.fork().pipeTo(write(x => console.info('fork2', x)))
 * // fork2 1, fork2 2, fork2 3, fork2 4, fork2 5, fork2 6, fork2 7
 * ```
 */
export class ForkableSink<T> implements UnderlyingSink<T>, Forkable<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #error?: any
  #finished = false
  #controllers = new Map<Controllable<T>, ReadableStream<T>>()

  abort(reason: unknown) {
    for (const [controller] of this.#controllers) controller.error(reason)
    this.#controllers.clear()
    this.#error = reason
    this.#finished = true
  }

  close() {
    for (const [controller] of this.#controllers) {
      try {
        controller.close()
      } catch (error) {
        // potentially already closed
      }
    }
    this.#controllers.clear()
    this.#finished = true
  }

  write(chunk: T) {
    for (const [controller] of this.#controllers)
      if (controller.desiredSize) controller.enqueue(chunk)
  }

  get finished() {
    return this.#finished
  }

  fork(
    underlyingSource?: UnderlyingSource<T>,
    queuingStrategy?: QueuingStrategy<T>,
  ) {
    return this._pipeThroughController(
      this._addController(underlyingSource, queuingStrategy),
    )
  }

  protected _addController(
    underlyingSource?: UnderlyingSource<T>,
    queuingStrategy?: QueuingStrategy<T>,
  ) {
    const controller = new ControllableSource<T>()
    const stream = new ReadableStream<T>(
      new SourceComposite<T>([
        controller,
        underlyingSource || {},
        {
          cancel: () => {
            this.#controllers.delete(controller)
          },
        },
      ]),
      queuingStrategy,
    )
    if (!this.#finished) this.#controllers.set(controller, stream)
    return [controller, stream] as const
  }

  protected _pipeThroughController([controller, stream]: readonly [
    Controllable<T>,
    ReadableStream<T>,
  ]) {
    if (this.#error) controller.error(this.#error)
    else if (this.#finished) controller.close()
    return stream
  }
}
