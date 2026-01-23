import { map } from './map'

/**
 * Maps each chunk as an object with a "label" and a "value".
 *
 * The label can be the result of a property on the chunk.
 *
 * @group Transformers
 * @see {@link groupBy:function}
 * @example
 * ```
 * --one--------------------two--------------------three-------------------
 *
 * label('length')
 *
 * --{label:3,value:'one'}--{label:3,value:'two'}--{label:5,value:'three'}-
 * ```
 */
export function label<T, K extends keyof T>(
  propName: K
): TransformStream<T, { label: T[K]; value: T }>

/**
 * The label can be the result of calling a provided function.
 *
 * @group Transformers
 * @example
 * ```
 * --6.1------------------4.2------------------6.3------------------
 *
 * label(Math.floor)
 *
 * --{label:6,value:6.1}--{label:4,value:4.2}--{label:6,value:6.3}--
 * ```
 */
export function label<T, L>(
  fn: (chunk: T) => L
): TransformStream<T, { label: L; value: T }>

export function label<T, X extends keyof T | ((chunk: T) => unknown)>(
  propNameOrFn: X
) {
  const getKey: (chunk: T) => unknown =
    typeof propNameOrFn === 'function'
      ? propNameOrFn
      : (chunk: T) => chunk[propNameOrFn as keyof T]

  return map((chunk: T) => ({
    label: getKey(chunk),
    value: chunk,
  }))
}
