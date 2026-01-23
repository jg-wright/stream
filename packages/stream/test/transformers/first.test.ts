import { fromTimeline } from '@johngw/stream-test-bun'
import { first } from '@johngw/stream/transformers/first'
import { expect, test } from 'bun:test'

test('gets only the first chunk', async () => {
  await expect(
    fromTimeline(`
    -1-X
    `).pipeThrough(first())
  ).toMatchTimeline(`
    -1-X
  `)
})
