import { CachableStream } from '@johngw/stream/sources/CachableStream'
import { ControllableStream } from '@johngw/stream/sources/ControllableStream'
import { MemoryStorage } from '@johngw/stream/storages/MemoryStorage'
import { StorageCache } from '@johngw/stream/storages/StorageCache'
import { throwUnlessAborted, timeout } from '@johngw/stream-common'
import { fromTimeline } from '@johngw/stream-test-bun'
import { cacheStream } from '@johngw/stream/sources/cacheStream'
import { write } from '@johngw/stream/sinks/write'
import { describe, beforeEach, expect, mock, test } from 'bun:test'

let cache: StorageCache

beforeEach(() => {
  cache = new StorageCache(new MemoryStorage(), 'test', 20)
})

describe('CachableStream', () => {
  test('only pulls when the cache is stale', async () => {
    await expect(
      cacheStream(
        cache,
        ['test'],
        fromTimeline(`
    --1-------2--|
      `),
      ),
    ).toMatchTimeline(`
    --1--T10--2--
  `)
  })

  test('starting a stream that already has cache', async () => {
    cache.set(['test'], 1)
    await expect(
      cacheStream(
        cache,
        ['test'],
        fromTimeline(`
    --1--2------|
      `),
      ),
    ).toMatchTimeline(`
    --1-T10-2--
  `)
  })

  test('invalidating cache', async () => {
    const abortController = new AbortController()
    const fn = mock((_x: number) => {})
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

    await timeout(5)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)

    cachableStream.clear()
    await timeout()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn.mock.calls[1]![0]).toBe(2)

    abortController.abort()
  })

  test('errors cancel the stream', async () => {
    const fn = mock()
    await expect(
      new CachableStream<number>(cache, ['test'], fn).pipeTo(write(), {
        signal: AbortSignal.abort(),
      }),
    ).rejects.toThrow()
    await timeout(5)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('when the source finishes', async () => {
    const fn = mock((_x: number) => {})
    const controller = new ControllableStream<number>()
    const abortController = new AbortController()

    controller.enqueue(1)
    controller.close()

    const cachableStream = cacheStream(cache, ['test'], controller)
    cachableStream
      .pipeTo(write(fn), { signal: abortController.signal })
      .catch(throwUnlessAborted)
    await timeout(25)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
    expect(cachableStream).toHaveProperty('sourceHasFinished', true)

    abortController.abort()
  })
})
