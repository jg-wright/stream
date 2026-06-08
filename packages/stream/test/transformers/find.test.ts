import { fromCollection } from '@johngw/stream/sources/fromCollection'
import { find } from '@johngw/stream/transformers/find'
import { write } from '@johngw/stream/sinks/write'
import { test, describe } from 'node:test'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('find', () => {
  test('queues the first found chunk and then terminates the stream', async () => {
    await assertTimeline(
      fromTimeline(`
        -0-1-2-3-4-X
      `).pipeThrough(find((chunk) => chunk === 4)),
      `
        ---------4-X
      `,
    )
  })

  test('using type guards', () => {
    type A = { type: 'a' }
    type B = { type: 'b' }
    type AB = A | B
    fromCollection<AB>([{ type: 'a' }, { type: 'b' }])
      .pipeThrough(find((chunk): chunk is B => chunk.type === 'b'))
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
