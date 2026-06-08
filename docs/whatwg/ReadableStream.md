---
layout: page
title: ReadableStream
permalink: /whatwg-stream-api/readable-stream
parent: WHATWG Streams API
nav_order: 1
---

[desiredSize]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultController/desiredSize
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[pull]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream#pull
[ReadableStream]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
[WritableStream]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
[write]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream/WritableStream#writechunk_controller

# ReadableStream

Streamed data starts with a [ReadableStream][] "source" and ends in a [WritableStream][] "sink".

```
+----------------+              +----------------+
| ReadableStream | ---pipeTo--> | WritableStream |
+----------------+              +----------------+
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

const writer = new WritableStream<number>({
  write(chunk) {
    console.info(chunk)
  },
})

reader.pipeTo(writer).then(() => console.info('done'))
// 1
// 2
// 3
// done
```

## Pulling from a source

The above example immediately queues 3 items in to a "source" that is then piped in to a "sink". Each item is consumed, with the [`WritableStream.prototype.write()`][write] function. Although perfectly acceptable, the above approach can be much improved, especially when dealing with large amounts of data, by registering a [pull][] function. The registered pull function will be called after a queued item has moved through the stream. It will also be called whether there is room in the queue or not.

```typescript
let i = 0

const reader = new ReadableStream<number>({
  pull(controller) {
    controller.enqueue(i++)
  },
})
```

An important feature to note about the [pull][] function is that when it returns a [Promise][] it will not be called again until the [Promise][] has resolved or when a queued item has just passed through the stream. One may want to implement back/forward pressure by checking the [desiredSize][] property.

```typescript
const asyncIterator = generateResults() // an async generator

const reader = new ReadableStream<number>({
  async pull(controller) {
    while (controller.desiredSize) {
      let result: IteratorResult<number>

      try {
        result = await asyncIterator.next()
      } catch (error) {
        return controller.error(error)
      }

      if (result.done) return controller.close()

      controller.enqueue(result.value)
    }
  },
})
```
