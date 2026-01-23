import type { Clearable } from '../types/Clearable'

/**
 * An in-memory storage class.
 *
 * @group Storages
 */
export class MemoryStorage implements Storage, Clearable {
  #data: Record<string, string> = {}

  get length() {
    return Object.keys(this.#data).length
  }

  clear() {
    this.#data = {}
  }

  getItem(key: string) {
    return (key in this.#data && this.#data[key]) || null
  }

  key(index: number) {
    return Object.keys(this.#data)[index] ?? null
  }

  removeItem(key: string) {
    delete this.#data[key]
  }

  setItem(key: string, value: string) {
    this.#data[key] = value
  }
}
