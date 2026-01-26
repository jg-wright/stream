import { expect, test, describe } from 'bun:test'

import { fromTimeline } from '@johngw/stream-test-bun'
import { after } from '@johngw/stream/transformers/after'

describe('after', () => {
  test('prevents chunks until predicate', async () => {
    await expect(
      fromTimeline<number>(`
    -0-1-2-3-4-5-6-1-2-3-4-|
    `).pipeThrough(after((x) => x > 4)),
    ).toMatchTimeline(`
    -----------5-6-1-2-3-4-
  `)
  })
})
