import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'
import { buffer } from '@johngw/stream/transformers/buffer'
import { test, describe, beforeEach, afterEach } from 'node:test'

describe('buffer', () => {
  let clock: FakeClock

  beforeEach(() => {
    clock = new FakeClock()
  })

  afterEach(() => {
    clock.uninstall()
  })

  test('buffers the source stream chunks until `notifier` emits.', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3-----------|
        `,
        { clock },
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        -----------null-----
            `,
            { clock },
          ),
        ),
      ),
      `
        -----------[1,2,3]--
      `,
      { clock },
    )
  })

  test('flushes whatever is left over when the notifier closes', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3---X
        `,
        { clock },
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        --------|
            `,
            { clock },
          ),
        ),
      ),
      `
        ---------[1,2,3]--
      `,
      { clock },
    )
  })

  test('flusher whatever is left over when the stream closes', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3--|
        `,
        { clock },
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        ------------------X
            `,
            { clock },
          ),
        ),
      ),
      `
        -----------[1,2,3]-
      `,
      { clock },
    )
  })

  test('max buffer size', async () => {
    await assertTimeline(
      fromTimeline(
        `
        --1--2--3--4--|
        `,
        { clock },
      ).pipeThrough(
        buffer(
          fromTimeline(
            `
        --------------
            `,
            { clock },
          ),
          2,
        ),
      ),
      `
        --------[3,4]-
      `,
      { clock },
    )
  })
})
