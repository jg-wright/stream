import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { toArray } from '@johngw/stream/sinks/toArray'
import { describe, expect, test } from 'bun:test'

describe('toArray', () => {
  test('consumes a stream in to an array of values', async () => {
    expect(
      await toArray(fromCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  test('errors in the stream will reject', async () => {
    await expect(
      toArray(
        fromCollection(
          (function* () {
            yield 1
            yield 2
            throw new Error('foo')
          })(),
        ),
      ),
    ).rejects.toThrow('foo')
  })

  describe('the catch options', () => {
    test('return an object with results', async () => {
      expect(
        await toArray(fromCollection([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), {
          catch: true,
        }),
      ).toEqual({ result: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] })
    })

    test('will return the error and any results before the error', async () => {
      expect(
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
      ).toMatchInlineSnapshot(`
    {
      "error": [Error: foo],
      "result": [
        1,
        2,
      ],
    }
  `)
    })
  })
})
