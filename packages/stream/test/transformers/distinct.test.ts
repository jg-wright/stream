import { expect, test, describe } from 'bun:test'
import { fromTimeline } from '@johngw/stream-test-bun'
import { distinct } from '@johngw/stream/transformers/distinct'
import { write } from '@johngw/stream/sinks/write'

describe('distinct', () => {
  test('only emits distinct values', async () => {
    await expect(
      fromTimeline(`
    -1-1-2-2-2-1-2-3-4-3-2-1-|
    `).pipeThrough(distinct()),
    ).toMatchTimeline(`
    -1---2---------3-4--------
  `)
  })

  test('selecting a distinct key', async () => {
    await expect(
      fromTimeline<{ a: number; n: string }>(`
    -{a: 4,n: f}-{a: 7,n: b}-{a: 5,n: f}-|
    `).pipeThrough(distinct({ selector: (x) => x.n })),
    ).toMatchTimeline(`
    -{a: 4,n: f}-{a: 7,n: b}-----------|
  `)
  })

  test('flushing with a stream', async () => {
    await expect(
      fromTimeline(`
    -1-1------1-1-|
    `).pipeThrough(
        distinct({
          flushes: fromTimeline(`
    -----N---------
        `),
        }),
      ),
    ).toMatchTimeline(`
    -1---1---------
  `)
  })

  test('allow flush errors to be sent down stream', async () => {
    await expect(
      fromTimeline(`
    -------------X
    `)
        .pipeThrough(
          distinct({
            flushes: fromTimeline(`
    -E------------
    `),
          }),
        )
        .pipeTo(write()),
    ).rejects.toThrow('Timeline Error')
  })

  test('disallow flush errors to be sent down stream', async () => {
    await expect(
      fromTimeline(`
    -1-1------1-1-|
    `).pipeThrough(
        distinct({
          ignoreFlushErrors: true,
          flushes: fromTimeline(`
    -----E---------
        `),
        }),
      ),
    ).toMatchTimeline(`
    -1-------------
  `)
  })
})
