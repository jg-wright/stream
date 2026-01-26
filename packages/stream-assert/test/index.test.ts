import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { test } from 'bun:test'

test('toMatchTimeline', async () => {
  await assertTimeline(
    fromTimeline(`
    --1--2--3--4--|
    `),
    `
    --1--2--3--4--
    `,
  )
})
