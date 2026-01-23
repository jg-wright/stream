import { fromTimeline } from '../src'
import { expect, test } from 'bun:test'

test('toMatchTimeline', async () => {
  await expect(
    fromTimeline(`
    --1--2--3--4--|
    `)
  ).toMatchTimeline(`
    --1--2--3--4--
  `)
})
