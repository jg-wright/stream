import { merge } from '@johngw/stream-common/Stream'
import { describe, expect, mock, test } from 'bun:test'
import { expectTimeline, fromTimeline } from '../src'

describe('expectTimeline', () => {
  test('expectTimeline', async () => {
    const fn = mock()

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

    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        1,
        1,
        Timeline {},
      ],
      [
        "a",
        "a",
        Timeline {},
      ],
      [
        2,
        2,
        Timeline {},
      ],
      [
        "b",
        "b",
        Timeline {},
      ],
      [
        3,
        3,
        Timeline {},
      ],
      [
        "c",
        "c",
        Timeline {},
      ],
      [
        4,
        4,
        Timeline {},
      ],
      [
        "d",
        "d",
        Timeline {},
      ],
      [
        5,
        5,
        Timeline {},
      ],
      [
        "e",
        "e",
        Timeline {},
      ],
    ]
  `)
  })

  test('objects and arrays', async () => {
    const fn = mock()

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

    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        {
          "foo": [
            "rab",
          ],
        },
        {
          "foo": [
            "bar",
          ],
        },
        Timeline {},
      ],
    ]
  `)
  })

  test('not enough chunks', async () => {
    const fn = mock()

    await expect(
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
    ).rejects.toThrow(`There are more expectations left.
--{foo: bar}--`)
  })

  test('not enough of a timeline', async () => {
    const fn = mock()

    await expect(
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
    ).rejects.toThrow('Received a value after the expected timeline:\n2')
  })

  test('errors in the timeline will error in the stream', async () => {
    const fn = mock()

    await expect(
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
    ).rejects.toThrow()
  })

  test('timing success', async () => {
    const fn = mock()

    await fromTimeline(`
    --1--T10--2--|
  `).pipeTo(
      expectTimeline(
        `
    --1--T10--2--
  `,
        fn,
      ),
    )

    expect(fn.mock.calls).toMatchInlineSnapshot(`
    [
      [
        1,
        1,
        Timeline {},
      ],
      [
        2,
        2,
        Timeline {},
      ],
    ]
  `)
  })

  test('timing errors', async () => {
    const fn = mock()

    await expect(
      fromTimeline(`
    --1--T5--2--|
    `).pipeTo(
        expectTimeline(
          `
    --1--T20--2--
        `,
          fn,
        ),
      ),
    ).rejects.toThrow(
      new RegExp(`Expected 20ms timer to have finished. There is \\d+ms left.

--1--T20--2--
     \\^
`),
    )
  })

  test('instances', async () => {
    const fn = mock()

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

    expect(fn.mock.calls).toHaveLength(0)

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

    expect(fn.mock.calls).toHaveLength(0)
  })
})
