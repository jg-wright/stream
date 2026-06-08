import { without } from '@johngw/stream-common/Array'
import type { Controllable, ControllerPullListener } from './Controllable.js'

/**
 * The underlying source of a ReadableStream that can have chunks
 * queued to from an external source.
 *
 * @group Sources
 * @example
 * Queuing items externally.
 *
 * ```
 * const controller = new ControllableSource<number>()
 * const stream = new ReadableStream(controller)
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
export class ControllableSource<T>
  implements ReadableStreamDefaultController<T>, Controllable<T>
{
  #controller!: ReadableStreamDefaultController<T>
  #pullListeners: ControllerPullListener<T>[] = []

  start(controller: ReadableStreamDefaultController<T>) {
    this.#controller = controller
  }

  async pull(controller: ReadableStreamDefaultController<T>) {
    if (!this.#pullListeners.length) return
    /*
    At first glance you may wonder why we're not using
    Promise.all. This is because we have no idea how long 
    each pullListener is going to take and we may want to 
    fill the desired size before all listeners have resolved. 
    Therefore we resolve when the 1st listener queues an item 
    so the stream can request more if it needs.
    */
    return new Promise<void>((resolve) => {
      this.#pullListeners.forEach(async (pullListener) => {
        try {
          controller.enqueue(await pullListener()!)
        } catch (error) {
          controller.error(error)
        } finally {
          resolve()
        }
      })
    })
  }

  get desiredSize() {
    return this.#controller.desiredSize
  }

  /**
   * Register a pull subscriber.
   *
   * @remark
   * When the stream is ready to pull it will pull from all
   * subscribers until the desired size has been fulfilled.
   */
  onPull(pullListener: ControllerPullListener<T>) {
    this.#pullListeners.push(pullListener)

    return () => {
      this.#pullListeners = without(this.#pullListeners, pullListener)
    }
  }

  error(error?: unknown) {
    this.#controller.error(error)
  }

  enqueue(chunk: T) {
    this.#controller.enqueue(chunk)
  }

  close() {
    this.#controller.close()
  }
}
