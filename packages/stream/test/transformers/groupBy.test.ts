import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { groupBy } from '@johngw/stream/transformers/groupBy'
import { test, describe } from 'node:test'

describe('groupBy', () => {
  test('using a property', async () => {
    await assertTimeline(
      fromTimeline<string>(`
        -one-------two-----------three------------------|
      `).pipeThrough(groupBy('length')),
      `
        -{3:[one]}-{3:[one,two]}-{3:[one,two],5:[three]}-
      `,
    )
  })

  test('using a function', async () => {
    await assertTimeline(
      fromTimeline(`
        -6.1-------4.2---------------6.3-------------------|
      `).pipeThrough(groupBy(Math.floor)),
      `
        -{6:[6.1]}-{4:[4.2],6:[6.1]}-{4:[4.2],6:[6.1, 6.3]}-
      `,
    )
  })
})
