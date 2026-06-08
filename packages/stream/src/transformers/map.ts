/**
 * Transforms chunks from one value to another.
 *
 * @group Transformers
 * @example
 * ```
 * --1----2----3----4----|
 *
 * map((x) => x + 1)
 *
 * --2----3----4----5----|
 * ```
 */
export function map<I, O>(fn: (x: I) => O | Promise<O>) {
  return new TransformStream<I, O>({
    async transform(chunk, controller) {
      try {
        controller.enqueue(await fn(chunk))
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
