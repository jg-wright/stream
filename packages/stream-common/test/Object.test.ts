import { describe, test, type TestContext } from 'node:test'
import {
  type MethodOverrides,
  type PickByValue,
  overrideObject,
} from '@johngw/stream-common/Object'
import { type Fail, type Pass, check, checks } from '@johngw/stream-common/Test'

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

  describe('overrideObject', () => {
    test('passes through non-overridden methods', (t: TestContext) => {
      const obj = {
        foo: () => 'foo',
        bar: () => 'bar',
      }
      const proxied = overrideObject(obj, {
        foo: () => 'overridden',
      })
      t.assert.strictEqual(proxied.bar(), 'bar')
    })

    test('passes through non-method properties', (t: TestContext) => {
      const obj = {
        name: 'original',
        greet: () => 'hello',
      }
      const proxied = overrideObject(obj, {
        greet: () => 'overridden',
      })
      t.assert.strictEqual(proxied.name, 'original')
    })

    test('replaces overridden methods with the override function', (t: TestContext) => {
      const obj = {
        foo: () => 'foo',
        bar: () => 'bar',
      }
      const proxied = overrideObject(obj, {
        foo: (target) => target.foo().split('').reverse().join(''),
      })
      t.assert.strictEqual(proxied.foo(), 'oof')
    })

    test('passes the override function additional arguments', (t: TestContext) => {
      const obj = {
        add: (a: number, b: number) => a + b,
      }
      const proxied = overrideObject(obj, {
        add: (target, a, b) => target.add(a, b) * 2,
      })
      t.assert.strictEqual(proxied.add(2, 3), 10)
    })

    test('preserves the original target identity for non-overridden access', (t: TestContext) => {
      const obj = {
        value: 42,
        method: () => 'unchanged',
      }
      const proxied = overrideObject(obj, {})
      t.assert.strictEqual(proxied.value, 42)
      t.assert.strictEqual(proxied.method(), 'unchanged')
    })

    test('preserves `this` binding for non-overridden methods via Reflect.get', (t: TestContext) => {
      const obj = {
        value: 7,
        getValue() {
          return this.value
        },
      }
      const proxied = overrideObject(obj, {})
      t.assert.strictEqual(proxied.getValue(), 7)
    })
  })

  test('MethodOverrides', () => {
    type Source = {
      str: string
      num: number
      foo(): string
      bar(x: number): boolean
    }

    type X = MethodOverrides<Source>

    checks([
      check<
        X,
        {
          foo: (target: Source) => string
          bar: (target: Source, x: number) => boolean
        },
        Pass
      >(),

      // Non-function properties should be filtered out.
      check<keyof X, 'foo' | 'bar', Pass>(),
      check<keyof X, 'foo' | 'bar' | 'str', Fail>(),
    ])
  })
})
