import { map } from './map.js'
import type { Accumulator } from '@johngw/stream-common/Function'

/**
 * Every chunk is transformed in to an accumulator.
 *
 * @group Transformers
 * @see {@link reduce:function}
 * @example
 * Accumulate all previous chunks with a counter.
 * ```
 * --0-------------------------1-------------------------------
 *
 * accumulate({ chunks: [], counter: 0 }, (acc, chunk) => ({
 *   chunks: [...acc.chunks, chunk],
 *   counter: acc.counter + 1
 * }))
 *
 * ----{chunks:[0],counter:1}------{chunks:[0,1],counter:2}----
 * ```
 */
export function accumulate<I, O>(acc: O, fn: Accumulator<I, O>) {
  return map<I, O>(async (chunk) => {
    acc = await fn(acc, chunk)
    return acc
  })
}
