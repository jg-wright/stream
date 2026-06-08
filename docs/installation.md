---
layout: page
title: Installation
permalink: /installation
nav_order: 4
---

# Installation

```
npm i @johngw/stream
```

## Node.js

Although the [WHATWG streams API has been included in Node.js](https://nodejs.org/api/webstreams.html) it's still in an experimental mode. However, as long as you're using version >=18 you'll be able to use this library for experimentation.

This module is also distributed as ESM, so you'll either:

- need to set your package as `"type": "module"` in the package.json
- use the `.mjs` extension for files that are using this library
- or use dynamic imports: `const { ControllableStream } = await import('@johngw/stream')`

### Typescript

When using TypeScript and you have chosen to use the dynamic import route, you'll also need to make sure your tsconfig's "moduleResolution" is set to "Node16" or "NodeNext".

## Webpack

Unlike a Node.js project, webpack will handle ESM imports without the need to change your code. If working with older browsers, however, you may need to include a polyfill for the web streams API.
