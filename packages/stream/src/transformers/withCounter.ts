import { map } from './map.js'

/**
 * Adds a counter representing the amount of chunks
 * received thus far.
 *
 * @group Transformers
 * @example
 * ```
 * --a----------------------b-------|
 *
 * withCounter()
 *
 * --{chunk:'a',counter:0}--{chunk:'b',counter:1}-|
 * ```
 */
export function withCounter<T>(start = 0) {
  let counter = start
  return map<T, { chunk: T; counter: number }>((chunk) => ({
    chunk,
    counter: counter++,
  }))
}
