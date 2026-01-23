import { test } from 'bun:test'
import { type PickByValue } from '../src/Object'
import { type Pass, check, checks } from '../src/Test'

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
