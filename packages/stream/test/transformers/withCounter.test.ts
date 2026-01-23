import { expect, test } from 'bun:test'

import { fromTimeline } from '@johngw/stream-test-bun'
import { withCounter } from '@johngw/stream/transformers/withCounter'

test('Adds a counter representing the amount of chunks received thus far', async () => {
  await expect(
    fromTimeline(`
    -a------------------------b------------------------c-----------------------|
    `).pipeThrough(withCounter())
  ).toMatchTimeline(`
    -{ chunk: a, counter: 0 }-{ chunk: b, counter: 1 }-{ chunk: c, counter: 2 }-
  `)
})

test('Can change the starting number', async () => {
  await expect(
    fromTimeline(`
    -a------------------------b------------------------c-----------------------|
    `).pipeThrough(withCounter(1))
  ).toMatchTimeline(`
    -{ chunk: a, counter: 1 }-{ chunk: b, counter: 2 }-{ chunk: c, counter: 3 }-
  `)
})
