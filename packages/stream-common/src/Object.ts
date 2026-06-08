/**
 * Pick object properties where the value is of a type.
 *
 * @group Utils
 * @category Object
 */
export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

/**
 * Returns true if `x` is an object and not `null`.
 *
 * @group Utils
 * @category Object
 */
export function isNonNullObject(x: unknown): x is Record<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyof any,
  unknown
> {
  return typeof x === 'object' && x !== null
}

/**
 * Returns true if `x` is `ArrayLike`.
 *
 * @group Utils
 * @category Object
 */
export function isArrayLike<T>(x: unknown): x is ArrayLike<T> {
  return isNonNullObject(x) && 'length' in x
}

/**
 * @group Utils
 * @category Object
 */
export function isIterable<T>(x: unknown): x is Iterable<T> {
  return isNonNullObject(x) && Symbol.iterator in x
}

/**
 * @group Utils
 * @category Object
 */
export function isAsyncIterable<T>(x: unknown): x is AsyncIterable<T> {
  return isNonNullObject(x) && Symbol.asyncIterator in x
}

/**
 * @group Utils
 * @category Object
 */
export function isIteratorOrAsyncIterator<T>(
  x: unknown,
): x is Iterator<T> | AsyncIterator<T> {
  return isNonNullObject(x) && 'next' in x
}

/**
 * Makes keys required, if they're not already.
 *
 * @group Utils
 * @category Object
 */
export type RequiredProps<Type, Key extends keyof Type> = Type & {
  [K in Key]-?: Type[K]
}

/**
 * Override methods on an object.
 *
 * @example
 * ```
 * const obj = {
 *   foo: () => 'foo',
 *   bar: () => 'bar',
 * }
 *
 * const obj2 = overrideObject(obj, {
 *   foo: (obj) => obj.foo().reverse()
 * })
 *
 * console.info(obj2.bar())
 * // 'bar'
 * console.info(obj2.foo())
 * // 'oof'
 * ```
 */
export function overrideObject<T extends object>(
  target: T,
  methods: Partial<MethodOverrides<T>>,
): T {
  return new Proxy(target, {
    get: (target, prop, receiver) =>
      prop in methods
        ? methods[prop as keyof typeof methods]!.bind(target, target)
        : Reflect.get(target, prop, receiver),
  })
}

export type MethodOverrides<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => unknown
    ? K
    : never]: T[K] extends (...args: any[]) => unknown
    ? (target: T, ...args: Parameters<T[K]>) => ReturnType<T[K]>
    : never
}
