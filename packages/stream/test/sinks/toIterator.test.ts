import { ControllableStream } from '@johngw/stream/sources/ControllableStream'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { toIterator } from '@johngw/stream/sinks/toIterator'
import { describe, test, type TestContext } from 'node:test'

describe('toIterator', () => {
  test('iteration over a collection of values', async (t: TestContext) => {
    const iterator = toIterator(fromCollection([1, 2, 3, 4, 5]))
    const values: number[] = []

    while (true) {
      const result = await iterator.next()
      if (result.done) break
      values.push(result.value)
    }

    t.assert.deepEqual(values, [1, 2, 3, 4, 5])
  })

  test('returning from the iterator will cancel the stream', async (t: TestContext) => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    const iterator = toIterator(controller)
    await iterator.return!()

    t.assert.throws(() => controller.enqueue(2), {
      message: 'Invalid state: Controller is already closed',
    })
  })

  test('throwing an error will cancel the stream', async (t: TestContext) => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    const iterator = toIterator(controller)
    t.assert.deepEqual(await iterator.throw!(new Error('foo')), {
      done: true,
      value: undefined,
    })

    t.assert.throws(() => controller.enqueue(2), {
      message: 'Invalid state: Controller is already closed',
    })
  })

  test('aborting will cancel the stream', async (t: TestContext) => {
    const controller = new ControllableStream<number>()
    controller.enqueue(1)

    toIterator(controller, { signal: AbortSignal.abort(new Error('foo')) })

    t.assert.throws(() => controller.enqueue(2), {
      message: 'Invalid state: Controller is already closed',
    })
  })
})
