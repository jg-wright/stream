import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { filter } from '@johngw/stream/transformers/filter'
import { write } from '@johngw/stream/sinks/write'
import { test, describe } from 'node:test'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('filter', () => {
  test('filters unwanted values', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2-3-4-5-6-7-8-9-|
      `).pipeThrough(filter((x) => x % 2 === 0)),
      `
        -0---2---4---6---8----
      `,
    )
  })

  test('using type guards', async () => {
    type A = { type: 'a' }
    type B = { type: 'b' }
    type AB = A | B

    await fromCollection<AB>([{ type: 'a' }, { type: 'b' }])
      .pipeThrough(filter((chunk): chunk is B => chunk.type === 'b'))
      .pipeTo(
        write((chunk) => {
          // @ts-expect-error This comparison appears to be unintentional because the types '"b"' and '"a"' have no overlap.
          // oxlint-disable-next-line no-unused-expressions
          chunk.type === 'a'
          // oxlint-disable-next-line no-unused-expressions
          chunk.type === 'b'
        }),
      )
  })
})
