/**
 * Groups chunks together as an array of the specified size.
 * When required to flush, it will queue anything left over.
 *
 * @group Transformers
 * @example
 * ```
 * --a----b------c------d------e--|
 *
 * chunks(2)
 *
 * -------[a,b]---------[c,d]--[e]-
 * ```
 */
export function bufferCount<T>(length: number) {
  if (length < 1)
    throw new Error(
      `bufferCount() cannot be used with a count less than one. Got "${length}".`,
    )

  if (!isFinite(length))
    throw new Error('bufferCount() cannot be used with an infinite number.')

  if (Math.round(length) !== length)
    throw new Error(
      `bufferCount() cannot be used with a floating point length. Got "${length}".`,
    )

  let buffer: T[] = []

  return new TransformStream<T, T[]>({
    transform(chunk, controller) {
      buffer.push(chunk)
      if (buffer.length === length) {
        controller.enqueue(buffer)
        buffer = []
      }
    },

    flush(controller) {
      if (buffer.length) controller.enqueue(buffer)
    },
  })
}
