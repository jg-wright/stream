import { fromTimeline } from '@johngw/stream-test-bun'
import { groupBy } from '@johngw/stream/transformers/groupBy'
import { expect, test } from 'bun:test'

test('using a property', async () => {
  await expect(
    fromTimeline<string>(`
    -one-------two-----------three------------------|
    `).pipeThrough(groupBy('length'))
  ).toMatchTimeline(`
    -{3:[one]}-{3:[one,two]}-{3:[one,two],5:[three]}-
  `)
})

test('using a function', async () => {
  await expect(
    fromTimeline(`
    -6.1-------4.2---------------6.3-------------------|
    `).pipeThrough(groupBy(Math.floor))
  ).toMatchTimeline(`
    -{6:[6.1]}-{4:[4.2],6:[6.1]}-{4:[4.2],6:[6.1, 6.3]}-
  `)
})
