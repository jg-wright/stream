import { expect, test, describe } from 'bun:test'

import { fromTimeline } from '@johngw/stream-test-bun'
import { bufferCount } from '@johngw/stream/transformers/bufferCount'

describe('bufferCount', () => {
  test('bufferCount in 2s', async () => {
    await expect(
      fromTimeline(`
    -1-2---3-4---5-6---7-8-----|
    `).pipeThrough(bufferCount(2)),
    ).toMatchTimeline(`
    ---[1,2]-[3,4]-[5,6]-[7,8]-
  `)
  })

  test('queues whatever remains after stream has closed', async () => {
    await expect(
      fromTimeline(`
    -1-2-3-4-5-------6-7-8-|
    `).pipeThrough(bufferCount(5)),
    ).toMatchTimeline(`
    ---------[1,2,3,4,5]---[6,7,8]-
  `)
  })

  test('infinit numbers will error', () => {
    expect(() => bufferCount(Infinity)).toThrow(
      'bufferCount() cannot be used with an infinite number.',
    )
  })

  test('floating points will error', () => {
    expect(() => bufferCount(1.1)).toThrow(
      'bufferCount() cannot be used with a floating point length. Got "1.1".',
    )
  })

  test('numbers less than 1 will error', () => {
    expect(() => bufferCount(0)).toThrow(
      'bufferCount() cannot be used with a count less than one. Got "0".',
    )
    expect(() => bufferCount(-2)).toThrow(
      'bufferCount() cannot be used with a count less than one. Got "-2".',
    )
  })
})
