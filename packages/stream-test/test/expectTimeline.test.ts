import { merge } from '@johngw/stream-common/Stream'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { expectTimeline, FakeClock, fromTimeline } from '@johngw/stream-test'

describe('expectTimeline', () => {
  let clock: FakeClock

  beforeEach(() => {
    clock = FakeClock.install()
  })

  afterEach(() => {
    FakeClock.uninstall()
  })

  test('expectTimeline', async ({ assert, mock }) => {
    const fn = mock.fn()

    await merge([
      fromTimeline(`
      --1---2---3---4---5---|
    `),
      fromTimeline(`
      ----a---b---c---d---e-|
    `),
    ]).pipeTo(
      expectTimeline(
        `
      --1-a-2-b-3-c-4-d-5-e-
        `,
        fn,
      ),
    )

    assert.snapshot(fn.mock.calls)
  })

  test('objects and arrays', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --{foo:[bar]}--|
    `).pipeTo(
      expectTimeline(
        `
      --{foo:[rab]}--
        `,
        fn,
      ),
    )

    assert.snapshot(fn.mock.calls)
  })

  test('not enough chunks', async ({ assert, mock }) => {
    const fn = mock.fn()

    await assert.rejects(
      fromTimeline(`
      --1--|
    `).pipeTo(
        expectTimeline(
          `
      --1--2--{foo: bar}--
          `,
          fn,
        ),
      ),
      {
        message: `There are more expectations left.
--{foo: bar}--

--1--2--{foo: bar}--
                   ^
`,
      },
    )
  })

  test('not enough of a timeline', async ({ assert, mock }) => {
    const fn = mock.fn()

    await assert.rejects(
      fromTimeline(`
    --1--2--3--|
    `).pipeTo(
        expectTimeline(
          `
    --1--
          `,
          fn,
        ),
      ),
      {
        message: `Received a value after the expected timeline:
2

--1--
    ^
`,
      },
    )
  })

  test('errors in the timeline will error in the stream', async ({
    assert,
    mock,
  }) => {
    const fn = mock.fn()

    await assert.rejects(
      fromTimeline(`
        --1--|
      `).pipeTo(
        expectTimeline(
          `
        --E--
          `,
          fn,
        ),
      ),
    )
  })

  test('timing success', async ({ assert, mock }) => {
    const fn = mock.fn()

    try {
      await fromTimeline(
        `
      --1--T10--2--|
    `,
      ).pipeTo(
        expectTimeline(
          `
      --1--T10--2--
        `,
          fn,
        ),
      )

      assert.snapshot(fn.mock.calls)
    } finally {
      clock.uninstall()
    }
  })

  test('timing errors', async ({ assert, mock }) => {
    const fn = mock.fn()

    await assert.rejects(
      fromTimeline(
        `
        --1--T5--2--|
      `,
      ).pipeTo(
        expectTimeline(
          `
        --1--T20--2--
          `,
          fn,
        ),
      ),
      new RegExp(`Expected 20ms timer to have finished. There is \\d+ms left.

--1--T20--2--
     \\^
`),
    )
  })

  test('instances', async ({ assert, mock }) => {
    const fn = mock.fn()

    await fromTimeline(`
      --<Date>--<Foo>--<Bar>--|
    `).pipeTo(
      expectTimeline(
        `
      --<Date>--<Foo>--<Bar>--|
        `,
        fn,
      ),
    )

    assert.equal(fn.mock.callCount(), 0)

    await new ReadableStream({
      start(controller) {
        controller.enqueue(new Date())
        controller.enqueue(new Date())
        controller.close()
      },
    }).pipeTo(
      expectTimeline(
        `
      --<Date>--<Date>--
        `,
        fn,
      ),
    )

    assert.equal(fn.mock.callCount(), 0)
  })
})
