---
layout: page
title: Sources
permalink: /extensions/sources
parent: Extensions
nav_order: 1
---

# Sources

This library considers a "source" as something we can "read" from. IE, a `ReadableStream`.

- [CachableStream](/stream/api/classes/stream.CachableStream.html)
- [ControllableStream](/stream/api/classes/stream.ControllableStream.html)
- [fromCollection](/stream/api/functions/stream.fromCollection.html)
- [fromDOMEvent](/stream/api/functions/stream.fromDOMEvent.html)
- [fromDOMIntersections](/stream/api/functions/stream.fromDOMIntersections.html)
- [fromDOMMutations](/stream/api/functions/stream.fromDOMMutations.html)
- [fromTimeline](/stream/api/functions/stream_test.fromTimeline.html)
- [immediatelyClosingReadableStream](/stream/api/functions/stream.immediatelyClosingReadableStream.html)
- [interval](/stream/api/functions/stream.interval.html)
- [merge](/stream/api/functions/stream.merge.html)
- [race](/stream/api/functions/stream.race.html)
- [roundRobin](/stream/api/functions/stream.roundRobin.html)

## Combining implementations

You can combine a number of source implmentations by using the [SourceComposite](/stream/api/classes/stream.SourceComposite.html).

```typescript
new ReadableStream(
  new SourceComposite([
    new ControllableStream(),
    { start: (controller) => controller.enqueue() },
  ]),
)
```
