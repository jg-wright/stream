import { test, describe } from 'node:test'
import { reduce } from '@johngw/stream/transformers/reduce'
import { write } from '@johngw/stream/sinks/write'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('reduce', () => {
  test('accumulates values from a stream', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2-3-4-|
      `).pipeThrough(
        reduce({} as Record<string, number>, (acc, chunk) => ({
          ...acc,
          [chunk.toString()]: chunk,
        })),
      ),
      `
        -----------{0: 0,1: 1,2: 2,3: 3,4: 4}-
      `,
    )
  })

  test('flushing', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2-3------------------4-5-|
      `).pipeThrough(
        reduce(
          {} as Record<string, number>,
          (acc, chunk) => ({
            ...acc,
            [chunk.toString()]: chunk,
          }),
          {
            flushes: fromTimeline(`
        ----------null----------------|
            `),
          },
        ),
      ),
      `
        ----------{0: 0,1: 1,2: 2,3: 3}---{0: 0,1: 1,2: 2,3: 3,4: 4,5: 5}-
      `,
    )
  })

  test('allow flush errors to be sent down stream', async ({ assert }) => {
    await assert.rejects(
      fromTimeline<number>(`
        ----|
      `)
        .pipeThrough(
          reduce(0, (acc, x) => acc + x, {
            flushes: fromTimeline(`
        --E-|
            `),
          }),
        )
        .pipeTo(write()),
    )
  })

  test('disallow flush errors to be sent down stream', async () => {
    await assertTimeline(
      fromTimeline<number>(`
        -0-1-2---3-4-5-|
      `).pipeThrough(
        reduce(0, (acc, x) => acc + x, {
          ignoreFlushErrors: true,
          flushes: fromTimeline(`
        -------E-------|
          `),
        }),
      ),
      `
        ---------------15-
      `,
    )
  })
})
