# @johngw/stream-jest

Jest extension for testing streams.

## Usage

```
npm i @johngw/stream-test @johngw/stream-jest
```

## API

### `toMatchTimeline()`

```typescript
// test/pairwise.ts

import { fromTimeline, pairwise } from '@johngw/stream'
import { fromTimeline } from '@johngw/stream-test-bun'
import { expect } from 'bun:test'

test('Queues the current value and previous values', async () => {
  await expect(
    fromTimeline(`
    --1--2------3------4------5------|
  `).pipeThrough(pairwise())
  ).toMatchTimeline(`
    -----[1,2]--[2,3]--[3,4]--[4,5]--
  `)
})
```
