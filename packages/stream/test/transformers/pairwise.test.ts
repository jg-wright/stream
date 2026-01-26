import { fromTimeline } from '@johngw/stream-test-bun'
import { pairwise } from '@johngw/stream/transformers/pairwise'
import { expect, test, describe } from 'bun:test'

describe('pairwise', () => {
  test('Queues the current value and previous values', async () => {
    await expect(
      fromTimeline(`
    --1--2------3------4------5------|
  `).pipeThrough(pairwise()),
    ).toMatchTimeline(`
    -----[1,2]--[2,3]--[3,4]--[4,5]--
  `)
  })
})
