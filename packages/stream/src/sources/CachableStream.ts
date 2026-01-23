import { StorageCache } from '../storages/StorageCache'
import type { Clearable } from '../types/Clearable'
import { CachableSource, type CachePuller } from './CachableSource'

/**
 * An extension to the `ReadableStream` that queues items
 * only when a timed cache becomes invalid.
 *
 * @group Sources
 * @see {@link StorageCache}
 * @see {@link CachableSource:class}
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
 * const stream = new CachableStream<number>(
 *   cache,
 *   ['numbers'],
 *   () => ++i
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
 * const stream = new CachableStream<number>(
 *   cache,
 *   ['numbers'],
 *   () => ++i
 * )
 *
 * stream.pipeTo(write(console.info))
 * // 1
 *
 * stream.clear()
 * // 2
 * ```
 */
export class CachableStream<T> extends ReadableStream<T> implements Clearable {
  readonly #source: CachableSource<T>

  constructor(
    cache: StorageCache,
    path: string[],
    pullItem: CachePuller<T>,
    ms: number = cache.ms
  ) {
    const source = new CachableSource(cache, path, pullItem, ms)
    super(source)
    this.#source = source
  }

  clear() {
    this.#source.clear()
  }

  get sourceHasFinished() {
    return this.#source.sourceHasFinished
  }
}
