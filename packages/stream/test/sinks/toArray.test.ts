import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { toArray } from '@johngw/stream/sinks/toArray'
import { describe, test, type TestContext } from 'node:test'

describe('toArray', () => {
  test('consumes a stream in to an array of values', async (t) => {
    t.assert.deepEqual(
      await toArray(fromCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    )
  })

  test('errors in the stream will reject', async (t) => {
    await t.assert.rejects(
      toArray(
        fromCollection(
          (function* () {
            yield 1
            yield 2
            throw new Error('foo')
          })(),
        ),
      ),
    )
  })

  describe('the catch options', () => {
    test('return an object with results', async (t) => {
      t.assert.deepEqual(
        await toArray(fromCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), {
          catch: true,
        }),
        { result: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      )
    })

    test('will return the error and any results before the error', async (t) => {
      t.assert.snapshot(
        await toArray(
          fromCollection(
            (function* () {
              yield 1
              yield 2
              throw new Error('foo')
            })(),
          ),
          { catch: true },
        ),
      )
    })
  })
})
