import { ForkableRecallStream } from '@johngw/stream/sinks/ForkableRecallStream'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { describe, test } from 'node:test'

describe('ForkableRecallStream', () => {
  test('subscribing will always provide that last chunk', async () => {
    const forkable = new ForkableRecallStream()

    await fromTimeline(`
      --1--2--3--4--5--|
    `).pipeTo(forkable)

    await assertTimeline(
      forkable.fork(),
      `
      --------------5--
      `,
    )

    await assertTimeline(
      forkable.fork(),
      `
      --------------5--
      `,
    )
  })
})
