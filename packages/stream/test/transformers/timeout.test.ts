import { timeout } from '@johngw/stream/transformers/timeout'
import { test, describe, beforeEach, afterEach } from 'node:test'
import { write } from '@johngw/stream/sinks/write'
import { FakeClock, fromTimeline } from '@johngw/stream-test'
import { assertTimeline } from '@johngw/stream-assert'

describe('timeout', () => {
  beforeEach(() => {
    FakeClock.install()
  })

  afterEach(() => {
    FakeClock.uninstall()
  })

  test('makes sure that events are emitted within a number of milliseconds', async ({
    assert,
  }) => {
    await assert.rejects(
      fromTimeline(
        `
        -T500-1-|
      `,
      )
        .pipeThrough(timeout(10))
        .pipeTo(write()),
      { message: 'Exceeded 10ms' },
    )

    await assertTimeline(
      fromTimeline(
        `
        -T5-1-T5-2-|
        `,
      ).pipeThrough(timeout(500)),
      `
        ----1----2--
      `,
    )
  })
})
