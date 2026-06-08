import type { Controllable, ControllerPullListener } from './Controllable.js'
import { ControllableSource } from './ControllableSource.js'

/**
 * A ControllableStream is ReadableStream that can have chunks
 * queued to from an external source.
 *
 * @group Sources
 * @example
 * Queuing items externally.
 *
 * ```
 * const controller = new ControllableStream<number>()
 * controller.enqueue(1)
 * controller.enqueue(2)
 * controller.enqueue(3)
 * controller.close()
 * ```
 *
 * Registering pull subscribers externally.
 *
 * ```
 * const controller = new ControllableStream<number>()
 * let i = -1
 * controller.onPull(() => ++i)
 * ```
 */
export class ControllableStream<T>
  extends ReadableStream<T>
  implements Controllable<T>
{
  readonly #source: ControllableSource<T>

  constructor(strategy?: QueuingStrategy<T>) {
    const source = new ControllableSource<T>()
    super(source, strategy)
    this.#source = source
  }

  get desiredSize() {
    return this.#source.desiredSize
  }

  /**
   * Register a pull subscriber.
   *
   * @remark
   * When the stream is ready to pull it will pull from all
   * subscribers until the desired size has been fulfilled.
   */
  onPull(pullListener: ControllerPullListener<T>) {
    return this.#source.onPull(pullListener)
  }

  error(error?: unknown) {
    this.#source.error(error)
  }

  enqueue(chunk: T) {
    this.#source.enqueue(chunk)
  }

  close() {
    this.#source.close()
  }
}
