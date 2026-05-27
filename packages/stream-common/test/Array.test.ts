import { describe, test, type TestContext } from 'node:test'
import { without } from '@johngw/stream-common/Array'

describe('Array', () => {
  test('without', (t: TestContext) => {
    t.assert.deepStrictEqual(without([1, 2, 3, 4], 2), [1, 3, 4])
    t.assert.deepStrictEqual(without([1, 2, 3, 4], 5), [1, 2, 3, 4])
    t.assert.deepStrictEqual(without([1, 2, 1, 2], 1), [2, 1, 2])
  })
})
