/**
 * Removes the first occurance of `item` in `array`.
 *
 * @group Utils
 * @category Array
 * @exampe
 * ```
 * without([1, 2, 3, 4, 5], 4)
 * // [1, 2, 3, 5]
 * ```
 */
export function without<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item)
  return index === -1
    ? array
    : [...array.slice(0, index), ...array.slice(index + 1)]
}
