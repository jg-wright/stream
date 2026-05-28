import type { Predicate } from '@johngw/stream-common/Function'

/**
 * Prevents chunks from travelling down the stream
 * until the predicate returns true.
 *
 * @group Transformers
 * @example
 * ```
 * --0--1--2--3--4--5--6--1--2--3--4--
 *
 * after(x => x > 4)
 *
 * -----------------5--6--1--2--3--4--
 * ```
 */
export function after<T>(predicate: Predicate<T>) {
  let pass = false

  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      if (pass) return controller.enqueue(chunk)

      try {
        pass = await predicate(chunk)
      } catch (error) {
        return controller.error(error)
      }

      if (pass) controller.enqueue(chunk)
    },
  })
}
