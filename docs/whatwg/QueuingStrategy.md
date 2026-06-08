---
layout: page
title: QueuingStrategy
permalink: /whatwg-stream-api/queuing-strategy
parent: WHATWG Streams API
nav_order: 4
---

[countqueuingstrategy]: https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy
[readablestream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[transformstream]: https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
[writablestream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream

# QueuingStrategy

Each [ReadableStream][] and [WritableStream][] object has it's own queue that can be configured with a `QueuingStrategy`.

Consider an example where we use a simple [CountQueuingStrategy][] that accepts a maximum of 3 items per queue.

```typescript
const reader = new ReadableStream(
  {...},
  new CountQueuingStrategy({ highWaterMark: 3 })
)

const writer = new WritableStream(
  {...},
  new CountQueuingStrategy({ highWaterMark: 3 })
)

reader.pipeTo(writer)
```

As the [WritableStream][] consumes a chunk, it can then pull another in to it's queue. The [WritableStream][] pulls an item from the [ReadableStream][] meaning the readable can then pull another item in to it's queue.

```
          +----------------+            +----------------+
          | ReadableStream |            | WritableStream |
          +----------------+            +----------------+
--- 7 --> |      6,  5     |  --- 4 --> |     3,  2      | --- 1 -->
          +----------------+            +----------------|
```

## Defaults

By default, all queuing strategies will be a [CountQueuingStrategy][] with a `highWaterMark` of `1`... all except the "Readable" side of a [TransformStream][], which has a [CountQueuingStrategy][] with a `highWaterMark` of `0`. This exception is still not quite understood by this library's author which is why backpressure has not been implemented correctly in transformers.
