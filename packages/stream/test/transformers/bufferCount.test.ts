import { test, describe } from 'node:test'
import { bufferCount } from '@johngw/stream/transformers/bufferCount'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('bufferCount', () => {
  test('bufferCount in 2s', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-2---3-4---5-6---7-8-----|
      `).pipeThrough(bufferCount(2)),
      `
        ---[1,2]-[3,4]-[5,6]-[7,8]-
      `,
    )
  })

  test('queues whatever remains after stream has closed', async () => {
    await assertTimeline(
      fromTimeline(`
        -1-2-3-4-5-------6-7-8-|
      `).pipeThrough(bufferCount(5)),
      `
        ---------[1,2,3,4,5]---[6,7,8]-
      `,
    )
  })

  test('infinit numbers will error', ({ assert }) => {
    assert.throws(() => bufferCount(Infinity), {
      message: 'bufferCount() cannot be used with an infinite number.',
    })
  })

  test('floating points will error', ({ assert }) => {
    assert.throws(() => bufferCount(1.1), {
      message:
        'bufferCount() cannot be used with a floating point length. Got "1.1".',
    })
  })

  test('numbers less than 1 will error', ({ assert }) => {
    assert.throws(() => bufferCount(0), {
      message:
        'bufferCount() cannot be used with a count less than one. Got "0".',
    })
    assert.throws(() => bufferCount(-2), {
      message:
        'bufferCount() cannot be used with a count less than one. Got "-2".',
    })
  })
})
