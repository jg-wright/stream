import { timeout } from '@johngw/stream-common/Async'
import { StorageCache } from '../storages/StorageCache.js'
import type { Clearable } from '../types/Clearable.js'

/**
 * Describes a function to pull data.
 *
 * @group Sources
 */
export interface CachePuller<T> {
  (): CachePullerResult<T> | Promise<CachePullerResult<T>>
}

/**
 * The result of a CachableStream pull.
 *
 * @group Sources
 */
export type CachePullerResult<T> = IteratorResult<T>

/**
 * The source of a `ReadableStream` that queues items
 * only when a timed cache becomes invalid.
 *
 * @group Sources
 * @see {@link StorageCache}
 * @see {@link CachableStream:class}
 * @example
 * Caching for 30 minutes.
 *
 * ```
 * const cache = new StorageCache(
 *   localStorage,
 *   'my-cache',
 *   30 * 60_000
 * )
 *
 * let i = 0
 * const stream = new ReadableStream(
 *   new CachableSource<number>(
 *     cache,
 *     ['numbers'],
 *     () => ++i
 *   )
 * )
 *
 * stream.pipeTo(write(console.info))
 * // 1
 *
 * await setTimeout(30 * 60_000))
 * // 2
 * ```
 * @example
 * Manually clearing cache.
 *
 * ```
 * const cache = new StorageCache(
 *   localStorage,
 *   'my-cache',
 *   30 * 60_000
 * )
 *
 * let i = 0
 * const source = new CachableSource<number>(
 *   cache,
 *   ['numbers'],
 *   () => ++i
 * )
 *
 * const stream = new ReadableStream(source)
 *
 * stream.pipeTo(write(console.info))
 * // 1
 *
 * source.clear()
 * // 2
 * ```
 */
export class CachableSource<T>
  implements UnderlyingDefaultSource<T>, Clearable
{
  #abortController = new AbortController()
  #sourceHasFinished = false

  readonly #cache: StorageCache
  readonly #ms: number
  readonly #path: string[]
  readonly #pullResult: CachePuller<T>

  constructor(
    cache: StorageCache,
    path: string[],
    pullResult: CachePuller<T>,
    ms: number = cache.ms,
  ) {
    this.#cache = cache
    this.#ms = ms
    this.#path = path
    this.#pullResult = pullResult
  }

  async pull(controller: ReadableStreamDefaultController<T>): Promise<void> {
    if (this.#sourceHasFinished) {
      const item = this.#cache.get(this.#path)
      return item === undefined
        ? controller.close()
        : controller.enqueue(item as T)
    } else if (
      await this.#cache.updateIfStale(this.#path, this.#pullItem, this.#ms)
    )
      controller.enqueue(this.#cache.get(this.#path) as T)
    else await this.#wait(this.#cache.timeLeft(this.#path))

    if (controller.desiredSize) return this.pull(controller)
  }

  cancel(reason: unknown) {
    this.#abortController.abort(reason)
  }

  readonly #pullItem = async (): Promise<T | void> => {
    const result = await this.#pullResult()
    if (result.done) this.#sourceHasFinished = true
    else return result.value
  }

  async #wait(ms: number) {
    try {
      await timeout(ms, undefined, this.#abortController.signal)
    } catch (error) {
      //
    }
  }

  clear() {
    this.#cache.unset(this.#path)
    this.#abortController.abort('clear')
    this.#abortController = new AbortController()
  }

  get sourceHasFinished() {
    return this.#sourceHasFinished
  }
}
