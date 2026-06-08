import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { map } from '@johngw/stream/transformers/map'
import { test, describe } from 'node:test'

describe('map', () => {
  test('transforms values', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2-3-4-5-6-7-8-9--|
      `).pipeThrough(map((chunk) => chunk + 1)),
      `
        -1-2-3-4-5-6-7-8-9-10-|
      `,
    )
  })
})
