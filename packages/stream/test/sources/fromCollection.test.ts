import { write } from '@johngw/stream/sinks/write'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { describe, expect, mock, test } from 'bun:test'
import '@johngw/stream-test-bun'

describe('fromCollection', () => {
  test('iterables', async () => {
    const fn = mock()
    await fromCollection([0, 1, 2]).pipeTo(write(fn))
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        0,
      ],
      [
        1,
      ],
      [
        2,
      ],
    ]
  `)
  })

  test('iterators', async () => {
    const fn = mock()
    let i = 0
    const iterator: Iterator<number> = {
      next: () =>
        i > 2 ? { done: true, value: undefined } : { done: false, value: i++ },
    }
    await fromCollection(iterator).pipeTo(write(fn))
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        0,
      ],
      [
        1,
      ],
      [
        2,
      ],
    ]
  `)
  })

  test('async iterables', async () => {
    const fn = mock()
    await fromCollection(
      (async function* () {
        yield 0
        yield 1
        yield 2
      })(),
    ).pipeTo(write(fn))
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        0,
      ],
      [
        1,
      ],
      [
        2,
      ],
    ]
  `)
  })

  test('async iterators', async () => {
    const fn = mock()
    let i = 0
    const iterator: AsyncIterator<number> = {
      next: async () =>
        i > 2 ? { done: true, value: undefined } : { done: false, value: i++ },
    }
    await fromCollection(iterator).pipeTo(write(fn))
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        0,
      ],
      [
        1,
      ],
      [
        2,
      ],
    ]
  `)
  })

  test('array likes', async () => {
    const fn = mock()
    await fromCollection({
      0: 'zero',
      1: 'one',
      2: 'two',
      length: 3,
    }).pipeTo(write(fn))
    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "zero",
      ],
      [
        "one",
      ],
      [
        "two",
      ],
    ]
  `)
  })

  test('empty array likes', async () => {
    const fn = mock()
    await fromCollection({ length: 0 }).pipeTo(write(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  test('errors', async () => {
    let aborted = false
    await expect(
      fromCollection({
        next() {
          throw new Error('Foo')
        },
      }).pipeTo(
        new WritableStream({
          abort(reason) {
            expect(reason).toHaveProperty('message', 'Foo')
            aborted = true
          },
        }),
      ),
    ).rejects.toThrow('Foo')
    expect(aborted).toBe(true)
  })

  test('unknown iterable type', async () => {
    expect(() =>
      fromCollection(
        // @ts-expect-error Argument of type '() => any' is not assignable to parameter of type
        () => 'mung',
      ),
    ).toThrow()
  })

  test('object entires', async () => {
    expect(fromCollection({ one: 1, two: 2, three: 3 })).toMatchTimeline(`
    -[one,1]-[two,2]-[three,3]-|
  `)
  })
})
