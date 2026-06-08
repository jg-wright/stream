import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { pairwise } from '@johngw/stream/transformers/pairwise'
import { test, describe } from 'node:test'

describe('pairwise', () => {
  test('Queues the current value and previous values', async () => {
    await assertTimeline(
      fromTimeline(`
        --1--2------3------4------5------|
      `).pipeThrough(pairwise()),
      `
        -----[1,2]--[2,3]--[3,4]--[4,5]--
      `,
    )
  })
})
