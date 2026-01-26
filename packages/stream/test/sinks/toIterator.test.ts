import { ControllableStream } from '@johngw/stream/sources/ControllableStream'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { toIterator } from '@johngw/stream/sinks/toIterator'
import { describe, expect, test } from 'bun:test'

describe('toIterator', () => {
  test('iteration over a collection of values', async () => {
    const iterator = toIterator(fromCollection([1, 2, 3, 4, 5]))
    const values: number[] = []

    while (true) {
      const result = await iterator.next()
      if (result.done) break
      values.push(result.value)
    }

    expect(values).toStrictEqual([1, 2, 3, 4, 5])
  })

  test('returning from the iterator will cancel the stream', async () => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    const iterator = toIterator(controller)
    await iterator.return!()

    expect(() => controller.enqueue(2)).toThrow(
      'Invalid state: Controller is already closed',
    )
  })

  test('throwing an error will cancel the stream', async () => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    const iterator = toIterator(controller)
    expect(await iterator.throw!(new Error('foo'))).toEqual({
      done: true,
      value: undefined,
    })

    expect(() => controller.enqueue(2)).toThrow(
      'Invalid state: Controller is already closed',
    )
  })

  test('aborting will cancel the stream', async () => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    toIterator(controller, { signal: AbortSignal.abort(new Error('foo')) })

    expect(() => controller.enqueue(2)).toThrow(
      'Invalid state: Controller is already closed',
    )
  })
})
