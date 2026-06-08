import { CachableStream } from '@johngw/stream/sources/CachableStream'
import type { CachePuller } from '@johngw/stream/sources/CachableSource'
import { ControllableStream } from '@johngw/stream/sources/ControllableStream'
import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { StorageCache } from '@johngw/stream/storages/StorageCache'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'
import { cacheStream } from '@johngw/stream/sources/cacheStream'
import { write } from '@johngw/stream/sinks/write'
import { describe, beforeEach, test, afterEach } from 'node:test'

let cache: StorageCache
let clock: FakeClock

beforeEach(() => {
  cache = new StorageCache(new MemoryStorage(), 'test', 20)
  clock = FakeClock.install()
})

afterEach(() => {
  FakeClock.uninstall()
})

describe('CachableStream', () => {
  test('only pulls when the cache is stale', async () => {
    await assertTimeline(
      cacheStream(
        cache,
        ['test'],
        fromTimeline(
          `
    --1-------2--|
          `,
        ),
      ),
      `
    --1--T10--2--
      `,
    )
  })

  test('starting a stream that already has cache', async () => {
    cache.set(['test'], 1)
    await assertTimeline(
      cacheStream(
        cache,
        ['test'],
        fromTimeline(
          `
    --1-----2-|
          `,
        ),
      ),
      `
    --1-T10-2--
      `,
    )
  })

  test('invalidating cache', async ({ assert, mock }) => {
    const abortController = new AbortController()
    const fn = mock.fn((_x: number) => {})
    let i = 0

    const cachableStream = new CachableStream<number>(
      cache,
      ['test'],
      () => ({ done: false, value: ++i }),
      1_000,
    )
    cachableStream
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)

    await clock.advance(5)
    assert.equal(fn.mock.callCount(), 1)
    assert.equal(fn.mock.calls[0]!.arguments[0], 1)

    cachableStream.clear()
    await clock.advance()
    assert.equal(fn.mock.callCount(), 2)
    assert.equal(fn.mock.calls[1]!.arguments[0], 2)

    abortController.abort()
  })

  test('errors cancel the stream', async ({ assert, mock }) => {
    const fn = mock.fn<CachePuller<number>>()
    await assert.rejects(
      new CachableStream<number>(cache, ['test'], fn).pipeTo(write(), {
        signal: AbortSignal.abort(),
      }),
    )
    await clock.advance(5)
    assert.equal(fn.mock.callCount(), 1)
  })

  test('when the source finishes', async ({ assert, mock }) => {
    const fn = mock.fn((_x: number) => {})
    const controller = new ControllableStream<number>()
    const abortController = new AbortController()

    controller.enqueue(1)
    controller.close()

    const cachableStream = cacheStream(cache, ['test'], controller)
    cachableStream
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)
    await clock.advance(25)

    assert.equal(fn.mock.callCount(), 1)
    assert.equal(fn.mock.calls[0]!.arguments[0], 1)
    assert.equal(cachableStream.sourceHasFinished, true)

    abortController.abort()
  })
})
