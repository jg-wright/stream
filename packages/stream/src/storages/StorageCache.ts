import { isNonNullObject } from '@johngw/stream-common/Object'

/**
 * Timed cache using a `Storage` interface.
 *
 * @group Storages
 * @example
 * Letting cache expire.
 *
 * ```
 * const cache = new StorageCache(localStorage, 'my-cache', 30 * 60_000)
 *
 * cache.set(['a', 'path'], 'foo')
 * cache.get(['a', 'path'])
 * // 'foo'
 *
 * await setTimeout(30 * 60_000)
 * cache.get(['a', 'path'])
 * // undefined
 * ```
 * @example
 * Manually invalidating cache.
 *
 * ```
 * const cache = new StorageCache(localStorage, 'my-cache', 30 * 60_000)
 * cache.set(['foo', 'bar'], 'a')
 * cache.set(['foo', 'rab'], 'b')
 *
 * // Remove a specific cache item
 * cache.unset(['foo', 'bar'])
 *
 * // Remove all "foos"
 * cache.unset(['foo'])
 * ```
 */
export class StorageCache {
  #storage: Storage
  #key: string
  #ms: number

  constructor(storage: Storage, key: string, ms: number) {
    this.#storage = storage
    this.#key = key
    this.#ms = ms
  }

  get ms() {
    return this.#ms
  }

  /**
   * Ads or overrides an item in the cache.
   */
  set(path: string[], value: unknown, ms = this.#ms) {
    this.#save({
      ...this.getAll(),
      [this.#pathKey(path)]: {
        t: Date.now() + ms,
        v: value,
      },
    })
    setTimeout(() => {
      this.unset(path)
    }, ms)
  }

  /**
   * Removes one or more items from the cache using the path
   * as key hierarchy.
   */
  unset(path: string[]) {
    const pathKey = this.#pathKey(path)
    this.#save(
      Object.entries(this.getAll()).reduce(
        (acc, [key, value]) =>
          this.#keyMatches(pathKey, key) ? acc : { ...acc, [key]: value },
        {},
      ),
    )
  }

  /**
   * Returns the cached value. Returns undefined if it doesn't
   * exist or if the cache is stale.
   */
  get(path: string[]) {
    return this.#get(path)?.v
  }

  /**
   * Checks if a path has cache. If not, updates it and returns `true`.
   * Otherwise returns `false`.
   */
  async updateIfStale(
    path: string[],
    update: () => unknown | Promise<unknown>,
    ms?: number,
  ) {
    let item = this.get(path)
    if (item === undefined) {
      item = await update()
      if (item === undefined) return false
      this.set(path, item, ms)
      return true
    }
    return false
  }

  /**
   * Returns the remaining cache time for an item.
   */
  timeLeft(path: string[]) {
    const now = Date.now()
    const time = this.#get(path)?.t || now
    return Math.max(time - now, 0)
  }

  #pathKey(path: string[]) {
    return path.join('.')
  }

  #keyMatches(pathKey: string, test: string) {
    return test === pathKey || test.startsWith(`${pathKey}.`)
  }

  #get(path: string[]) {
    const result = this.getAll()[this.#pathKey(path)]
    if (!isStoredItem(result)) return undefined
    return result
  }

  #save(obj: Record<string, unknown>) {
    this.#storage.setItem(this.#key, JSON.stringify(obj))
  }

  getAll() {
    return JSON.parse(this.#storage.getItem(this.#key) || '{}')
  }
}

interface StoredItem<T> {
  t: number
  v: T
}

function isStoredItem<T>(x: unknown): x is StoredItem<T> {
  return isNonNullObject(x) && typeof x.t === 'number' && 'v' in x
}
