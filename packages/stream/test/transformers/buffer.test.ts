import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'
import { buffer } from '@johngw/stream/transformers/buffer'
import { test, describe, beforeEach, afterEach } from 'node:test'

describe('buffer', () => {
  beforeEach(() => {
    FakeClock.install()
  })

  afterEach(() => {
    FakeClock.uninstall()
  })

  test('buffers the source stream chunks until `notifier` emits.', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3-----------|
        `,
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        -----------null-----
            `,
          ),
        ),
      ),
      `
        -----------[1,2,3]--
      `,
    )
  })

  test('flushes whatever is left over when the notifier closes', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3---X
        `,
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        --------|
            `,
          ),
        ),
      ),
      `
        ---------[1,2,3]--
      `,
    )
  })

  test('flusher whatever is left over when the stream closes', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3--|
        `,
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        ------------------X
            `,
          ),
        ),
      ),
      `
        -----------[1,2,3]-
      `,
    )
  })

  test('max buffer size', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3--4--|
        `,
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        --------------
            `,
          ),
          2,
        ),
      ),
      `
        --------[3,4]-
      `,
    )
  })
})
