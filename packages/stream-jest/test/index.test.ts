import { fromTimeline } from '../src'
import { expect } from 'expect'
import { test } from '@jest/globals'

test('toMatchTimeline', async () => {
  await expect(
    fromTimeline(`
    --1--2--3--4--|
    `),
  ).toMatchTimeline(`
    --1--2--3--4--
  `)
})
