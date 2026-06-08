import { empty, type Empty } from '@johngw/stream-common/Symbol'

/**
 * Puts the current value and previous value together as an array, and queues that.
 *
 * @group Transformers
 * @example
 * ```
 * --a----b------c------d------
 *
 * pairwise()
 *
 * -------[a,b]--[b,c]--[c,d]--
 * ```
 */
export function pairwise<T>() {
  let previous: T | Empty = empty

  return new TransformStream<T, [T, T]>({
    transform(chunk, controller) {
      if (previous !== empty) controller.enqueue([previous, chunk])
      previous = chunk
    },
  })
}
