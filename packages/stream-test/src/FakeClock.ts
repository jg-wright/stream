import { Clock, setDefaultClock } from '@johngw/timeline/Clock'
import FakeTimers from '@sinonjs/fake-timers'

export interface Uninstallable {
  uninstall(): void
}

export class FakeClock extends Clock implements Uninstallable {
  static #instance?: FakeClock

  static install() {
    if (!this.#instance) this.#instance = new FakeClock()
    return this.#instance
  }

  static uninstall() {
    this.#instance?.uninstall()
    this.#instance = undefined
  }

  #fake = FakeTimers.install({
    toFake: [
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
      'Date',
    ],
  })

  #uninstall = setDefaultClock(this)

  private constructor() {
    super()
    // Auto-advance to the next pending timer whenever the event loop would
    // otherwise be idle. This breaks deadlocks where time can only move via
    // a fake timer that nothing is actively driving — e.g. a CachableSource
    // waiting out its cache TTL while its timeline source isn't being pulled.
    this.#fake.setTickMode({ mode: 'nextAsync' })
  }

  override get now() {
    return this.#fake.now
  }

  override wait(frames: number) {
    return new Promise<void>((resolve) => {
      this.#fake.setTimeout(() => resolve(), frames)
    })
  }

  override async advance(frames = 1) {
    for (let i = 0; i < frames; i++) await this.#fake.tickAsync(1)
  }

  uninstall() {
    this.#uninstall()
    this.#fake.uninstall()
  }
}
