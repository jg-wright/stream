import { fromTimeline } from '@johngw/stream-jest'
import { expect } from 'expect'
import { describe, test } from '@jest/globals'

describe('stream-jest', () => {
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
