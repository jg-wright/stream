import { describe, test } from 'node:test'
import { type PickByValue } from '@johngw/stream-common/Object'
import { type Pass, check, checks } from '@johngw/stream-common/Test'

describe('Object', () => {
  test('PickByValue', () => {
    checks([
      check<
        PickByValue<
          {
            foo: 'bar'
            num: 1
            bool: true
            mar: 'far'
          },
          string
        >,
        { foo: 'bar'; mar: 'far' },
        Pass
      >(),
    ])
  })
})
