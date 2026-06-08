/**
 * Subscribe to chunks in the stream, immediately passing any
 * chunks on to the pipe.
 *
 * @group Transformers
 * @example
 * ```
 * --1--2--3--4--5--6--
 *
 * tap(chunk => console.info(x))
 *
 * --1--2--3--4--5--6--
 * ```
 */
export function tap<T>(fn: (chunk: T) => unknown) {
  return new TransformStream<T, T>({
    transform(chunk, controller) {
      fn(chunk)
      controller.enqueue(chunk)
    },
  })
}
