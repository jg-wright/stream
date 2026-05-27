import { withLatestFrom } from '@johngw/stream/transformers/withLatestFrom'
import { write } from '@johngw/stream/sinks/write'
import { test, describe, type TestContext } from 'node:test'
import { assertTimeline, fromTimeline } from '@johngw/stream-assert'

describe('withLatestFrom', () => {
  test('combines each value from the source with the latest values from other inputs', async () => {
    await assertTimeline(
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
      `
        --[a,1,x]---[b,4,y]--[c,4,y]-[d,4,y]-[e,4,y]-
      `,
    )
  })

  test('aborting in one subsequent stream will error in the others', async (t: TestContext) => {
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

    t.assert.ok(reason! !== undefined, '`reason` is undefined')
    t.assert.equal(reason!.message, 'foo')
  })

  test('aborting in subsequent streams will error in the source', async (t: TestContext) => {
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

    t.assert.ok(reason! !== undefined, '`reason` is undefined')
    // FIXME: The webstreams polyfill provides an incorrect error
    t.assert.equal(reason!.message, 'foo')
  })

  test('erroring in the source will error in subsequent streams', async (t: TestContext) => {
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

    t.assert.ok(reason! !== undefined, '`reason` is undefined')
    // FIXME: The webstreams polyfill provides an incorrect error
    t.assert.equal(reason!.message, 'foo')
  })

  test('aborting the resulting stream will error upstream', async (t: TestContext) => {
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

    t.assert.ok(reason1! !== undefined, '`reason1` is undefined')
    // FIXME: The webstreams polyfill provides an incorrect error
    t.assert.equal(reason1!.message, 'foo')
    t.assert.ok(reason2! !== undefined, '`reason2` is undefined')
    // FIXME: The webstreams polyfill provides an incorrect error
    t.assert.equal(reason2!.message, 'foo')
  })
})
