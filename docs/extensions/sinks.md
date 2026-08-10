---
layout: page
title: Sinks
permalink: /extensions/sinks
parent: Extensions
nav_order: 2
---

# Sinks

This library considers a "sink" to be something to write to. IE, a `WritableStream`.

- [expectTimeline](/stream/api/functions/stream_test.expectTimeline.html)
- [ForkableStream](/stream/api/classes/stream.ForkableStream.html)
- [ForkableRecallStream](/stream/api/classes/stream.ForkableRecallStream.html)
- [ForkableReplayStream](/stream/api/classes/stream.ForkableReplayStream.html)
- [toArray](/stream/api/functions/stream.toArray.html)
- [toIterable](/stream/api/functions/stream.toIterable.html)
- [toIterator](/stream/api/functions/stream.toIterator.html)
- [write](/stream/api/functions/stream.write.html)

## Combining implementations

You can combine a number of sink implmentations by using the [SinkComposite](/stream/api/classes/stream.SinkComposite.html).

```typescript
new WritableStream(
  new SinkComposite([new ForkableRecallSink(), write(console.info)]),
)
```
