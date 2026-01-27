import { fromTimeline } from '../src/index.js'
import { describe, expect, test } from 'bun:test'

describe('stream-test-bun', () => {
  test('toMatchTimeline', async () => {
    await expect(
      fromTimeline(`
    --1--2--3--4--|
    `),
    ).toMatchTimeline(`
    --1--2--3--4--
  `)
  })
})
