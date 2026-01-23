import type { Predicate } from '@johngw/stream-common/Function'

/**
 * Filters out queued chunks based on a predicate.
 *
 * @group Transformers
 * @example
 * ```
 * --1--2--3--4--5--6--7--8--9--
 *
 * filter((x) => x % 2 === 0)
 *
 * -----2-----4-----6-----8-----
 *
 * Using type guards will extract the types you want to work with.
 *
 * ```
 * --A--B--A--B---
 *
 * filter((x): x is B => x.type === 'b')
 *
 * -----B-----B---
 * ```
 */
export function filter<In, Out extends In>(
  predicate: (chunk: In) => chunk is Out
): TransformStream<In, Out>

export function filter<In>(predicate: Predicate<In>): TransformStream<In, In>

export function filter<In, Out extends In = In>(predicate: Predicate<In>) {
  return new TransformStream<In, Out>({
    async transform(chunk, controller) {
      try {
        if (await predicate(chunk)) controller.enqueue(chunk as Out)
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
