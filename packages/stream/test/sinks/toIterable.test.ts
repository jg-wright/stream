import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { toIterable } from '@johngw/stream/sinks/toIterable'
import { describe, test, type TestContext } from 'node:test'

describe('fromCollection', () => {
  test('turns a stream in to an async iterable', async (t: TestContext) => {
    const array: number[] = []
    for await (const item of toIterable(fromCollection([1, 2, 3, 4, 5])))
      array.push(item)
    t.assert.deepEqual(array, [1, 2, 3, 4, 5])
  })

  test('cancels the stream when an error occurs in the iterable', async (t: TestContext) => {
    await t.assert.rejects(
      (async () => {
        for await (const _item of toIterable(
          new ReadableStream({
            start(controller) {
              controller.error(new Error('foo'))
            },
          }),
        )) {
          //
        }
      })(),
    )
  })
})
