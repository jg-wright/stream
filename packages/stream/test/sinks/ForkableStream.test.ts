import { mock } from 'bun:test'
import { ForkableStream } from '../../src/sinks/ForkableStream'
import { write } from '../../src/sinks/write'
import { interval } from '../../src/sources/interval'
import { tap } from '../../src/transformers/tap'
import { timeout } from '@johngw/stream-common'
import { expectTimeline, fromTimeline } from '@johngw/stream-test-bun'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type Mock,
  test,
} from 'bun:test'

describe('ForkableStream', () => {
  let forkable: ForkableStream<number>
  let fn: Mock<(x: number) => void>
  let readable: ReadableStream<number>

  beforeEach(() => {
    forkable = new ForkableStream()
    fn = mock()
    readable = fromTimeline(`
    --1--2--3--4--5--|
  `)
  })

  test('fork before piping', async () => {
    const promise = forkable.fork().pipeTo(
      expectTimeline(`
    --1--2--3--4--5--
    `),
    )
    readable.pipeTo(forkable)
    await promise
  })

  test('fork after piping', async () => {
    readable.pipeTo(forkable)
    await forkable.fork().pipeTo(
      expectTimeline(`
    --1--2--3--4--5--
    `),
    )
  })

  test('multiple subscribers', async () => {
    readable.pipeTo(forkable)
    await Promise.all([
      forkable.fork().pipeTo(
        expectTimeline(`
      --1--2--3--4--5--
      `),
      ),
      forkable.fork().pipeTo(
        expectTimeline(`
      --1--2--3--4--5--
      `),
      ),
      forkable.fork().pipeTo(
        expectTimeline(`
      --1--2--3--4--5--
      `),
      ),
    ])
  })

  test('finished property', async () => {
    await readable.pipeTo(forkable)
    expect(forkable.finished).toBe(true)
  })

  test('finished streams will immediately close forks', async () => {
    await readable.pipeTo(forkable)
    await forkable
      .fork({
        pull(controller) {
          controller.enqueue(6)
        },
      })
      .pipeTo(write(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  describe('aborting', () => {
    let fn: Mock<(data: Date) => void>
    let forkable: ForkableStream<Date>
    let abortController: AbortController

    beforeEach(() => {
      fn = mock()
      forkable = new ForkableStream<Date>()
      abortController = new AbortController()
      interval(5)
        .pipeThrough(tap(fn))
        .pipeTo(forkable, { signal: abortController.signal })
        .catch(() => {
          //
        })
    })

    afterEach(async () => {
      abortController.abort()
    })

    test('previously aborted streams will error new forks', async () => {
      abortController.abort()
      await timeout()
      await expect(forkable.fork().pipeTo(write())).rejects.toThrow()
    })

    test('aborting an stream will error previous forks', async () => {
      const fork = forkable.fork().pipeTo(write())
      abortController.abort()
      await expect(fork).rejects.toThrow()
    })

    test('should not affect upstream', async () => {
      await expect(
        forkable.fork().pipeTo(write(), { signal: AbortSignal.timeout(10) }),
      ).rejects.toThrow()
      await timeout(50)
      expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5)
    })

    test('will cancel the fork', async () => {
      let cancelled = false
      await expect(
        forkable
          .fork({
            cancel() {
              cancelled = true
            },
          })
          .pipeTo(write(), { signal: AbortSignal.timeout(10) }),
      ).rejects.toThrow()
      expect(cancelled).toBe(true)
    })
  })
})
