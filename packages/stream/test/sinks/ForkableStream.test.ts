import { ForkableStream } from '@johngw/stream/sinks/ForkableStream'
import { write } from '@johngw/stream/sinks/write'
import { interval } from '@johngw/stream/sources/interval'
import { tap } from '@johngw/stream/transformers/tap'
import { timeout } from '@johngw/stream-common'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import {
  afterEach,
  beforeEach,
  describe,
  mock,
  type Mock,
  test,
  type TestContext,
} from 'node:test'

describe('ForkableStream', () => {
  let forkable: ForkableStream<number>
  let fn: Mock<(x: number) => void>
  let readable: ReadableStream<number>

  beforeEach(() => {
    forkable = new ForkableStream()
    fn = mock.fn()
    readable = fromTimeline(`
      --1--2--3--4--5--|
    `)
  })

  test('fork before piping', async () => {
    const promise = assertTimeline(
      forkable.fork(),
      `
      --1--2--3--4--5--
      `,
    )
    readable.pipeTo(forkable)
    await promise
  })

  test('fork after piping', async () => {
    readable.pipeTo(forkable)
    await assertTimeline(
      forkable.fork(),
      `
      --1--2--3--4--5--
      `,
    )
  })

  test('multiple subscribers', async () => {
    readable.pipeTo(forkable)
    await Promise.all([
      assertTimeline(
        forkable.fork(),
        `
        --1--2--3--4--5--
        `,
      ),
      assertTimeline(
        forkable.fork(),
        `
        --1--2--3--4--5--
        `,
      ),
      assertTimeline(
        forkable.fork(),
        `
        --1--2--3--4--5--
        `,
      ),
    ])
  })

  test('finished property', async (t: TestContext) => {
    await readable.pipeTo(forkable)
    t.assert.ok(forkable.finished)
  })

  test('finished streams will immediately close forks', async (t: TestContext) => {
    await readable.pipeTo(forkable)
    await forkable
      .fork({
        pull(controller) {
          controller.enqueue(6)
        },
      })
      .pipeTo(write(fn))
    t.assert.equal(fn.mock.callCount(), 0)
  })

  describe('aborting', () => {
    let fn: Mock<(data: Date) => void>
    let forkable: ForkableStream<Date>
    let abortController: AbortController

    beforeEach(() => {
      fn = mock.fn()
      forkable = new ForkableStream<Date>()
      abortController = new AbortController()
      interval(5)
        .pipeThrough(tap(fn))
        .pipeTo(forkable, { signal: abortController.signal })
        .catch(() => {
          //
        })
    })

    afterEach(() => {
      abortController.abort()
    })

    test('previously aborted streams will error new forks', async (t: TestContext) => {
      abortController.abort()
      await timeout()
      await t.assert.rejects(forkable.fork().pipeTo(write()))
    })

    test('aborting an stream will error previous forks', async (t: TestContext) => {
      const fork = forkable.fork().pipeTo(write())
      abortController.abort()
      await t.assert.rejects(fork)
    })

    test('should not affect upstream', async (t: TestContext) => {
      await t.assert.rejects(
        forkable.fork().pipeTo(write(), { signal: AbortSignal.timeout(10) }),
      )
      await timeout(50)
      t.assert.ok(fn.mock.callCount() >= 5)
    })

    test('will cancel the fork', async (t: TestContext) => {
      let cancelled = false
      await t.assert.rejects(
        forkable
          .fork({
            cancel() {
              cancelled = true
            },
          })
          .pipeTo(write(), { signal: AbortSignal.timeout(10) }),
      )
      t.assert.ok(cancelled)
    })
  })
})
