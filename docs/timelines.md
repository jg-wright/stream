---
layout: page
title: Timelines
permalink: /timelines
nav_order: 5
---

# Timelines

A timeline is the way to describe and test streams over a period of time. For example, consider the following:

```
--1--2--3--4--
```

The above is a stream that queues 1, 2, 3, 4.

The following is an example of merging 2 streams together and what the result would be after.

```
merge([
--1---2---3---4--
----a---b---c----
])

--1-a-2-b-3-c-4--
```

## Syntax

The syntax for timelines are as follows:

### Closing a stream

A stream will only close, when specified to do so, with the pipe character: `|`.

For example:

```
--1--2--3--4--|
```

### Errors

An error can be populated downstream with the capital letter `E`.

### Never

Sometimes you may want to create an expectation that the timeline should **never** reach. Use the capital `X` for such a scenario.

For example, the `buffer` transformer's test uses this to test that the buffer's `notifier` close event will close the source stream:

```
--1--2--3---X

buffer(
--------|
)

--------[1,2,3]
```

### Timers

To signal waiting for a period of milliseconds, use a capital `T` followed by a number, representing the amount of `milliseconds` to wait for.

For example:

```
--1--2------

debounce(10)

-----T10-2--
```

### Null

Although the keyword `null` can be used, a shorter `N` can also be used.

### Booleans

Althought the keywords `true` & `false` can be used, the shorter versions `T` & `F` can also be used.

### Numbers, Strings, Boolean, Objects & Arrays

Any combination of characters, other than a dash (`-`) or any of the above syntax, will be parsed by [js-yaml](https://github.com/nodeca/js-yaml).

## Testing

There are a couple functions to help with testing.

- [expectTimeline](/stream/api/functions/stream_test.expectTimeline.html)
- [fromTimeline](/stream/api/functions/stream_test.fromTimeline.html)
