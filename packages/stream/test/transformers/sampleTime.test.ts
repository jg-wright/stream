import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'
import { sampleTime } from '@johngw/stream/transformers/sampleTime'
import test, { afterEach, beforeEach } from 'node:test'

beforeEach(() => {
  FakeClock.install()
})

afterEach(() => {
  FakeClock.uninstall()
})

test('produces samples of the last state sent', async () => {
  await assertTimeline(
    fromTimeline(`1-T40-|`).pipeThrough(sampleTime(20)),
    `T20-1-T20-1`,
  )
})
