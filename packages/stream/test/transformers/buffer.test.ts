import { fromTimeline } from '@johngw/stream-test-bun'
import { buffer } from '@johngw/stream/transformers/buffer'
import { expect, test } from 'bun:test'

test('buffers the source stream chunks until `notifier` emits.', async () => {
  await expect(
    fromTimeline(`
    --1--2--3-----------|
    `).pipeThrough(
      buffer(
        fromTimeline(`
    -----------null-----
        `)
      )
    )
  ).toMatchTimeline(`
    -----------[1,2,3]--
  `)
})

test('flushes whatever is left over when the notifier closes', async () => {
  await expect(
    fromTimeline(`
    --1--2--3---X
    `).pipeThrough(
      buffer(
        fromTimeline(`
    --------|
        `)
      )
    )
  ).toMatchTimeline(`
    ---------[1,2,3]--
  `)
})

test('flusher whatever is left over when the stream closes', async () => {
  await expect(
    fromTimeline(`
    --1--2--3--|
    `).pipeThrough(
      buffer(
        fromTimeline(`
    ------------------X
        `)
      )
    )
  ).toMatchTimeline(`
    -----------[1,2,3]-
  `)
})

test('max buffer size', async () => {
  await expect(
    fromTimeline(`
    --1--2--3--4--|
    `).pipeThrough(
      buffer(
        fromTimeline(`
    --------------
        `),
        2
      )
    )
  ).toMatchTimeline(`
    --------[3,4]-
  `)
})
