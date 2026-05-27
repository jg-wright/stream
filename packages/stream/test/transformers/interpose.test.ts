import { defer, timeout } from '@johngw/stream-common'
import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { interpose } from '@johngw/stream/transformers/interpose'
import { write } from '@johngw/stream/sinks/write'
import { test, describe } from 'node:test'

describe('interpose', () => {
  test('holds up a stream until a promise resolves', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    const { promise, resolve } = defer()
    fromCollection([1, 2, 3, 4, 5, 6])
      .pipeThrough(interpose(promise))
      .pipeTo(write(fn))
    await timeout()
    assert.equal(fn.mock.callCount(), 0)
    resolve()
    await timeout()
    assert.snapshot(fn.mock.calls)
  })

  test("holds up a stream until a function's returned promise resolves", async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()
    const { promise, resolve } = defer()
    fromCollection([1, 2, 3, 4, 5, 6])
      .pipeThrough(interpose(() => promise))
      .pipeTo(write(fn))
    await timeout()
    assert.equal(fn.mock.callCount(), 0)
    resolve()
    await timeout()
    assert.snapshot(fn.mock.calls)
  })

  test('errored promises will error downstream', async ({ assert, mock }) => {
    const fn = mock.fn()
    const promise = Promise.reject(new Error('foo'))
    await assert.rejects(
      fromCollection([1, 2, 3, 4, 5, 6])
        .pipeThrough(interpose(promise))
        .pipeTo(write(fn)),
      { message: 'foo' },
    )
  })
})
