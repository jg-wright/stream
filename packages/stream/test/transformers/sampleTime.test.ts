import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { sampleTime } from '@johngw/stream/transformers/sampleTime'
import test from 'node:test'

test('produces samples of the last state sent', async () => {
  await assertTimeline(
    fromTimeline(`
      1-T20---T20---2--T10--|
    `).pipeThrough(sampleTime(20)),
    `
      --T10-1-T10-1-T10-2--
    `,
  )
})
