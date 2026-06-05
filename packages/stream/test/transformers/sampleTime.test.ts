import { assertTimeline, FakeClock, fromTimeline } from '@johngw/stream-assert'
import { sampleTime } from '@johngw/stream/transformers/sampleTime'
import test, { afterEach, beforeEach } from 'node:test'

let clock: FakeClock

beforeEach(() => {
  clock = new FakeClock()
})

afterEach(() => {
  clock.uninstall()
})

test('produces samples of the last state sent', async () => {
  // Deterministic now: sampleTime(20) emits its latest value every 20
  // frames — exactly `T20`, not the old wall-clock-fudged `T18`/`T14`.
  await assertTimeline(
    fromTimeline(`1-T40-|`, { clock }).pipeThrough(sampleTime(20)),
    `T20-1-T20-1`,
    { clock },
  )
})
