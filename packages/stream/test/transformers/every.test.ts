import { expect, test } from 'bun:test'

import { fromTimeline } from '@johngw/stream-test-bun'
import { every } from '@johngw/stream/transformers/every'
import { write } from '@johngw/stream/sinks/write'

test('when not', async () => {
  await expect(
    fromTimeline<number>(`
    -5-10-15-18-----X
    `).pipeThrough(every((chunk) => chunk % 5 === 0))
  ).toMatchTimeline(`
    ---------F-------
  `)
})

test('when true', async () => {
  await expect(
    fromTimeline<number>(`
    -5-10-15-20-|
    `).pipeThrough(every((chunk) => chunk % 5 === 0))
  ).toMatchTimeline(`
    ------------T
  `)
})

test('flushing', async () => {
  await expect(
    fromTimeline<number>(`
    -5-10-15-20-------25-----|
    `).pipeThrough(
      every((chunk) => chunk % 5 === 0, {
        flushes: fromTimeline(`
    ------------N-------------
        `),
      })
    )
  ).toMatchTimeline(`
    ------------T------------T
  `)
})

test('allow flush errors to be sent down stream', async () => {
  await expect(
    fromTimeline(`
    -----
    `)
      .pipeThrough(
        every(() => true, {
          flushes: fromTimeline(`
    --E--
          `),
        })
      )
      .pipeTo(write())
  ).rejects.toThrow('Timeline Error')
})

test('disallow flush errors to be sent down stream', async () => {
  await expect(
    fromTimeline<number>(`
    -1-1---1--------|
    `).pipeThrough(
      every(() => true, {
        ignoreFlushErrors: true,
        flushes: fromTimeline(`
    -----E-----------
        `),
      })
    )
  ).toMatchTimeline(`
    ----------------T
  `)
})
