import {
  isArrayLike,
  isAsyncIterable,
  isIterable,
} from '@johngw/stream-common/Object'

/**
 * Deeply flattens `Iterable`s, `AsyncIterable`s & `ArrayLike`s.
 *
 * @group Transformers
 * @example
 * ```
 * --[1]--2----[3,[4]]---|
 *
 * flat()
 *
 * --1----2-----3-4------|
 * ```
 */
export function flat<T>() {
  return new TransformStream(new FlatTransformer<T>())
}

type Flattened<T> = T extends string
  ? T
  : T extends ArrayLike<infer V>
  ? Flattened<V>
  : T extends Iterable<infer V>
  ? Flattened<V>
  : T extends AsyncIterable<infer V>
  ? Flattened<V>
  : T

class FlatTransformer<T> implements Transformer<T, Flattened<T>> {
  transform(
    chunk: T,
    controller: TransformStreamDefaultController<Flattened<T>>
  ) {
    return typeof chunk === 'string'
      ? controller.enqueue(chunk as Flattened<T>)
      : isIterable<T>(chunk)
      ? this.#transformIterator(chunk, controller)
      : isAsyncIterable<T>(chunk)
      ? this.#transformAsyncIterator(chunk, controller)
      : isArrayLike<T>(chunk)
      ? this.#transformArrayLike(chunk, controller)
      : controller.enqueue(chunk as Flattened<T>)
  }

  async #transformIterator(
    chunk: Iterable<T>,
    controller: TransformStreamDefaultController<Flattened<T>>
  ) {
    for (const x of chunk) await this.transform(x, controller)
  }

  async #transformAsyncIterator(
    chunk: AsyncIterable<T>,
    controller: TransformStreamDefaultController<Flattened<T>>
  ) {
    for await (const x of chunk) await this.transform(x, controller)
  }

  async #transformArrayLike(
    chunk: ArrayLike<T>,
    controller: TransformStreamDefaultController<Flattened<T>>
  ) {
    for (let i = 0; i < chunk.length; i++)
      await this.transform(chunk[i]!, controller)
  }
}
