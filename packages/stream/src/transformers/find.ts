import type { Predicate } from '@johngw/stream-common/Function'

/**
 * Call the predicate on each chunk in the queue.
 * The first chunk to pass the predicate will be queued
 * and the stream will be terminated.
 *
 * @group Transformers
 * @example
 * ```
 * --1--2--3--4--5--6-X
 *
 * find((x) => x === 6)
 *
 * -----------------6-|
 * ```
 *
 * Using type guards will extract the types you want to work with.
 *
 * ```
 * --A--A--A--B--X
 *
 * find((x): x is B => x.type === 'b')
 *
 * -----------B--|
 * ```
 */
export function find<In, Out extends In>(
  predicate: (chunk: In) => chunk is Out
): TransformStream<In, Out>

export function find<In>(predicate: Predicate<In>): TransformStream<In, In>

export function find<In, Out extends In = In>(predicate: Predicate<In>) {
  return new TransformStream<In, Out>({
    async transform(chunk, controller) {
      try {
        if (await predicate(chunk)) {
          controller.enqueue(chunk as Out)
          controller.terminate()
        }
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
