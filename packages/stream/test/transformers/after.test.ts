import { test, describe } from 'node:test'
import { after } from '@johngw/stream/transformers/after'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('after', () => {
  test('prevents chunks until predicate', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2-3-4-5-6-1-2-3-4-|
      `).pipeThrough(after((x) => x > 4)),
      `
        -----------5-6-1-2-3-4-
      `,
    )
  })
})
