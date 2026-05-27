import { assertTimeline, fromTimeline } from '@johngw/stream-assert'
import { label } from '@johngw/stream/transformers/label'
import { test, describe } from 'node:test'

describe('label', () => {
  test('using a property', async () => {
    await assertTimeline(
      fromTimeline<string>(`
        -one-------------------two-------------------three------------------|
      `).pipeThrough(label('length')),
      `
        -{label: 3,value: one}-{label: 3,value: two}-{label: 5,value: three}-
      `,
    )
  })

  test('using a function', async () => {
    await assertTimeline(
      fromTimeline(`
        -6.1-------------------4.2-------------------6.3------------------|
      `).pipeThrough(label(Math.floor)),
      `
        -{label: 6,value: 6.1}-{label: 4,value: 4.2}-{label: 6,value: 6.3}-
      `,
    )
  })
})
