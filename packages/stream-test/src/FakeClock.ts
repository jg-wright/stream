import { Clock, setDefaultClock } from '@johngw/timeline/Clock'
import FakeTimers, { type VoidVarArgsFunc } from '@sinonjs/fake-timers'

export class FakeClock extends Clock {
  static #instance?: FakeClock

  static install() {
    if (!this.#instance) this.#instance = new FakeClock()
    return this.#instance
  }

  static uninstall() {
    if (!this.#instance) return
    this.#instance.#timers.uninstall()
    this.#instance.#restoreDefaultClock()
    this.#instance = undefined
  }

  #timers = FakeTimers.install({
    toFake: [
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
      'Date',
    ],
  })

  #restoreDefaultClock = setDefaultClock(this)

  private constructor() {
    super()
    // Auto-advance to the next pending timer whenever the event loop would
    // otherwise be idle. This breaks deadlocks where time can only move via
    // a fake timer that nothing is actively driving — e.g. a CachableSource
    // waiting out its cache TTL while its timeline source isn't being pulled.
    this.#timers.setTickMode({ mode: 'nextAsync' })
  }

  override get now() {
    return this.#timers.now
  }

  override wait(frames: number) {
    return new Promise<void>((resolve) => {
      this.#timers.setTimeout(resolve as VoidVarArgsFunc, frames)
    })
  }

  override async advance(frames = 1) {
    for (let i = 0; i < frames; i++) await this.#timers.tickAsync(1)
  }
}
