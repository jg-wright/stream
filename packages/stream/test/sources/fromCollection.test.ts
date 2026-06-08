import { write } from '@johngw/stream/sinks/write'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { describe, test } from 'node:test'
import { assertTimeline } from '@johngw/stream-assert'

describe('fromCollection', () => {
  test('iterables', async ({ assert, mock }) => {
    const fn = mock.fn()
    await fromCollection([0, 1, 2]).pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('iterators', async ({ assert, mock }) => {
    const fn = mock.fn()
    let i = 0
    const iterator: Iterator<number> = {
      next: () =>
        i > 2 ? { done: true, value: undefined } : { done: false, value: i++ },
    }
    await fromCollection(iterator).pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('async iterables', async ({ assert, mock }) => {
    const fn = mock.fn()
    await fromCollection(
      (async function* () {
        yield 0
        yield 1
        yield 2
      })(),
    ).pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('async iterators', async ({ assert, mock }) => {
    const fn = mock.fn()
    let i = 0
    const iterator: AsyncIterator<number> = {
      next: async () =>
        i > 2 ? { done: true, value: undefined } : { done: false, value: i++ },
    }
    await fromCollection(iterator).pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('array likes', async ({ assert, mock }) => {
    const fn = mock.fn()
    await fromCollection({
      0: 'zero',
      1: 'one',
      2: 'two',
      length: 3,
    }).pipeTo(write(fn))
    assert.snapshot(fn.mock.calls)
  })

  test('empty array likes', async ({ assert, mock }) => {
    const fn = mock.fn()
    await fromCollection({ length: 0 }).pipeTo(write(fn))
    assert.equal(fn.mock.callCount(), 0)
  })

  test('errors', async ({ assert }) => {
    await assert.rejects(
      fromCollection({
        next() {
          throw new Error('Foo')
        },
      }).pipeTo(
        new WritableStream({
          abort(reason) {
            assert.equal(reason.message, 'Foo')
          },
        }),
      ),
      { message: 'Foo' },
    )
  })

  test('unknown iterable type', async ({ assert }) => {
    assert.throws(() =>
      fromCollection(
        // @ts-expect-error Argument of type '() => any' is not assignable to parameter of type
        () => 'mung',
      ),
    )
  })

  test('object entires', async () => {
    await assertTimeline(
      fromCollection({ one: 1, two: 2, three: 3 }),
      `
      -[one,1]-[two,2]-[three,3]-|
      `,
    )
  })
})
