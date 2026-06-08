---
layout: page
title: TransformStream
permalink: /whatwg-stream-api/transform-stream
parent: WHATWG Streams API
nav_order: 3
---

[pipeThrough]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeThrough
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[TransformStream]: https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
[WritableStream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream

# TransformStream

A [TransformStream][] is a combination of a [ReadableStream][] in a [WritableStream][]. It can be added after any [ReadableStream][] using it's [pipeThrough][] method. The [pipeThrough][] will return another [ReadableStream][] that can be used for chaining.

```
+----------------+                   +-----------------+              +----------------+
| ReadableStream | ---pipeThrough--> | TransformStream | ---pipeTo--> | WritableStream |
+----------------+                   +-----------------+              +----------------+
```

```typescript
const reader = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1)
    controller.enqueue(2)
    controller.enqueue(3)
    controller.close()
  },
})

const transformer = new TransformStream<number, string>(
  transform(chunk, controller) {
    controller.enqueue(chunk.toString())
  }
)

const writer = new WritableStream<string>({
  write(chunk) {
    console.info(chunk)
  },
})

reader.pipeThrough(transformer).pipeTo(writer).then(() => console.info('done'))
// '1'
// '2'
// '3'
// 'done'
```

If the `transform` function were to return a `Promise`, then it won't be called again until the `Promise` resolves.
