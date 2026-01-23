import type { PickByValue } from '@johngw/stream-common/Object'
import type { Stringable } from '@johngw/stream-common/String'
import { accumulate } from './accumulate'

/**
 * Accumulates each chunk into an object where the key is the result of
 * calling a provided function or using a chunk's property.
 *
 * The key can be the result of a property on the chunk.
 *
 * @group Transformers
 * @see {@link label:function}
 * @example
 * ```
 * --one------------two------------------three-----------------------------
 *
 * groupBy('length')
 *
 * --{'3':['one']}--{'3',['one','two']}--{'3':['one','two'],'5':['three']}-
 * ```
 */
export function groupBy<T, K extends keyof PickByValue<T, Stringable>>(
  propName: K
): TransformStream<T, Record<string, T[]>>

/**
 * The key can be the result of calling a provided function.
 *
 * @example
 * ```
 * --6.1----------4.2--------------------6.3------------------------
 *
 * groupBy(Math.floor)
 *
 * --{'6':[6.1]}--{'4':[4.2],'6':[6.1]}--{'4':[4.2],'6':[6.1,6.3]}--
 * ```
 */
export function groupBy<T, G extends Stringable>(
  propName: (chunk: T) => G
): TransformStream<T, Record<string, T[]>>

export function groupBy<
  T,
  X extends keyof PickByValue<T, Stringable> | ((chunk: T) => string)
>(propNameOrFn: X) {
  const getKey: (chunk: T) => string =
    typeof propNameOrFn === 'function'
      ? propNameOrFn
      : (chunk: T) => (chunk[propNameOrFn as keyof T] as Stringable).toString()

  return accumulate<T, Record<string, T[]>>({}, (acc, chunk) => {
    const key = getKey(chunk)
    return { ...acc, [key]: key in acc ? [...acc[key]!, chunk] : [chunk] }
  })
}
