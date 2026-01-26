import { fromTimeline } from '@johngw/stream-test-bun'
import { timeout } from '@johngw/stream/transformers/timeout'
import { expect, test, describe } from 'bun:test'
import { write } from '@johngw/stream/sinks/write'

describe('timeout', () => {
  test('makes sure that events are emitted within a number of milliseconds', async () => {
    await expect(
      fromTimeline(`
      -T500-1-|
    `)
        .pipeThrough(timeout(10))
        .pipeTo(write()),
    ).rejects.toThrow('Exceeded 10ms')

    await expect(
      fromTimeline(`
    -T5-1-T5-2-|
    `).pipeThrough(timeout(500)),
    ).toMatchTimeline(`
    ----1----2--
  `)
  })
})
