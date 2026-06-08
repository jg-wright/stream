import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { first } from '@johngw/stream/transformers/first'
import { test, describe } from 'node:test'

describe('first', () => {
  test('gets only the first chunk', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-X
      `).pipeThrough(first()),
      `
        -1-X
      `,
    )
  })
})
