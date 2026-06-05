# stream

Reactive programming tools using the WHATWG Streams API.

See the [docs](https://johngeorgewright.github.io/stream/) for more information.

## Building

1. Install [Bun](https://bun.sh/).
1. Install dependencies: `bun install`
1. Start an incremental build tool: `bun start`. Or build once: `bun run build`

### Building Documentation

We're using a combination of [Jekyll](https://jekyllrb.com/) for static file generation and [Typedoc](https://typedoc.org/) for API generation.

1. Install [Ruby](https://www.ruby-lang.org/).
1. Install depenedencies: `bundle install`
1. Build documentation: `bun run build:docs`. Or start a server: `bun run serve:docs`.
