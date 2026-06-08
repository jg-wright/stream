---
layout: page
title: WritableStream
permalink: /whatwg-stream-api/writable-stream
parent: WHATWG Streams API
nav_order: 2
---

[pipeTo]: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/pipeTo
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[write]: https://developer.mozilla.org/en-US/docs/Web/API/WritableStream/WritableStream#writechunk_controller

# WritableStream

Data begins to travel through a stream once it is been piped, with the [pipeTo][] function, in to a sink. The sink's [write][] function will be called per "chunk". The [write][] function will only be called again when it's optional, returned [Promise][] resolves.

```typescript
new WritableStream({
  async write(chunk) {
    await doSomething(chunk)
  },
})
```
