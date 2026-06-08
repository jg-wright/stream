/**
 * Hold up a stream until a promise resolves. If it errors,
 * the error will be emitted to the stream.
 *
 * @group Transformers
 * @example
 * ```
 * ----a-------b------|
 *
 * interpose(async () => await setTimeout(50))
 *
 * --------a--------b-|
 * ```
 */
export function interpose<T>(
  promise: Promise<void> | ((chunk: T) => Promise<void>),
) {
  const fn = typeof promise === 'function' ? promise : () => promise

  return new TransformStream<T, T>({
    async transform(chunk, controller) {
      try {
        await fn(chunk)
      } catch (error) {
        return controller.error(error)
      }
      controller.enqueue(chunk)
    },
  })
}
