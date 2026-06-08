import { test, describe } from 'node:test'
import { withCounter } from '@johngw/stream/transformers/withCounter'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('withCounter', () => {
  test('Adds a counter representing the amount of chunks received thus far', async () => {
    await assertTimeline(
      fromTimeline(`
        -a------------------------b------------------------c-----------------------|
      `).pipeThrough(withCounter()),
      `
        -{ chunk: a, counter: 0 }-{ chunk: b, counter: 1 }-{ chunk: c, counter: 2 }-
      `,
    )
  })

  test('Can change the starting number', async () => {
    await assertTimeline(
      fromTimeline(`
        -a------------------------b------------------------c-----------------------|
      `).pipeThrough(withCounter(1)),
      `
        -{ chunk: a, counter: 1 }-{ chunk: b, counter: 2 }-{ chunk: c, counter: 3 }-
      `,
    )
  })
})
