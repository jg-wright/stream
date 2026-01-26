import { fromTimeline } from '@johngw/stream-test-bun'
import { withLatestFrom } from '@johngw/stream/transformers/withLatestFrom'
import { write } from '@johngw/stream/sinks/write'
import { expect, test, describe } from 'bun:test'

describe('withLatestFrom', () => {
  test('combines each value from the source with the latest values from other inputs', async () => {
    await expect(
      fromTimeline(`
    --a----------b-------c-------d-------e--|
    `).pipeThrough(
        withLatestFrom(
          fromTimeline(`
    -1---2-3-4---|
        `),
          fromTimeline(`
    -x-----y-|
        `),
        ),
      ),
    ).toMatchTimeline(`
    --[a,1,x]---[b,4,y]--[c,4,y]-[d,4,y]-[e,4,y]-
  `)
  })

  test('aborting in one subsequent stream will error in the others', async () => {
    let reason: Error

    await new ReadableStream()
      .pipeThrough(
        withLatestFrom(
          new ReadableStream({
            cancel($reason) {
              reason = $reason
            },
          }),
          new ReadableStream({
            start(controller) {
              controller.error(new Error('foo'))
            },
          }),
        ),
      )
      .pipeTo(write())
      .catch(() => {
        //
      })

    expect(reason!).toBeDefined()
    expect(reason!).toHaveProperty('message', 'foo')
  })

  test('aborting in subsequent streams will error in the source', async () => {
    let reason: Error

    await new ReadableStream({
      cancel($reason) {
        reason = $reason
      },
    })
      .pipeThrough(
        withLatestFrom(
          new ReadableStream({
            start(controller) {
              controller.error(new Error('foo'))
            },
          }),
        ),
      )
      .pipeTo(write())
      .catch(() => {
        //
      })

    // FIXME: The webstreams polyfill provides an incorrect error
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // expect(reason!).toHaveProperty('message', 'foo')

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(reason!).not.toBe(undefined)
  })

  test('erroring in the source will error in subsequent streams', async () => {
    let reason: Error

    await new ReadableStream({
      start(controller) {
        controller.error(new Error('foo'))
      },
    })
      .pipeThrough(
        withLatestFrom(
          new ReadableStream({
            cancel($reason) {
              reason = $reason
            },
          }),
        ),
      )
      .pipeTo(write())
      .catch(() => {
        //
      })

    // FIXME: The webstreams polyfill provides an incorrect error
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // expect(reason!).toHaveProperty('message', 'foo')

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(reason!).not.toBe(undefined)
  })

  test('aborting the resulting stream will error upstream', async () => {
    let reason1: Error
    let reason2: Error

    await new ReadableStream({
      cancel(reason) {
        reason1 = reason
      },
    })
      .pipeThrough(
        withLatestFrom(
          new ReadableStream({
            cancel(reason) {
              reason2 = reason
            },
          }),
        ),
      )
      .pipeTo(write(), { signal: AbortSignal.abort(new Error('foo')) })
      .catch(() => {
        //
      })

    // FIXME: The webstreams polyfill provides an incorrect error
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // expect(reason1!).toHaveProperty('message', 'foo')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // expect(reason2!).toHaveProperty('message', 'foo')

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(reason1!).not.toBe(undefined)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(reason2!).not.toBe(undefined)
  })
})
