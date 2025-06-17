# Mithril to Sin Bridge

A compatibility layer that allows running Mithril applications on Sin (v2.2.15+), providing a seamless migration path for existing Mithril codebases.

> **Note**: This is not an official project and is currently focused on UDM compatibility.

## About the Project

This bridge aims to provide a 1:1 compatibility layer between Mithril and Sin, allowing developers to gradually migrate their applications while maintaining full functionality. The project focuses on maintaining API compatibility while leveraging Sin's modern architecture.

## Roadmap

**🟢 Current Compatibility (core runtime only): ~85%**

### Core Virtual DOM API
* [X] `m()` hyperscript: map `m(tag, attrs, children)` to Sin VDOM
* [X] Fragment support (`[]`) and text-node handling
* [~] Vnode normalization: `attrs`, `children`, `state`, `dom`, `instance`
* [X] `m.mount(root, component)` via Sin's mount API
* [X] `m.render(root, vnode)`: client-side render without routing
* [X] `m.redraw()` shim and auto-redraw on events/timers
* [X] Support for key-based list diffing (Mithril's `key` attribute)
* [X] `m.trust` HTML trust: render raw HTML without escaping
* [X] `m.censor` HTML escape: sanitize or escape text nodes to prevent XSS
* [ ] Handle optimistic updates instead of reloading the whole page

### Components & Lifecycle
* [X] Object-components: `view`, `oninit`, `oncreate`, `onupdate`, `onbeforeremove`, `onremove`
* [X] Function-components support
* [ ] `onbeforeupdate` hook mapping
* [ ] `onbeforedelete` hook mapping
* [X] Context propagation (`this`/`vnode.state`) consistency

### Attributes & Events
* [X] Attribute translation: `class`, `style`, `id`, custom attributes
* [X] Event binding: `onclick`, `oninput`, `onchange`, etc., via Sin's event API
* [X] `data-*` attribute passthrough
* [X] `oncreate` and `onupdate` DOM ref callbacks

### Routing Compatibility
* [X] `m.route(root, defaultRoute, routes)` (Currently we dont support mounting to another that the document.body)
* [X] Dynamic segments (`/:param`) and splat (`*`) routes
* [X] Query-string parsing/building
* [X] `m.route.param(name)`: retrieve route parameter values
* [ ] Route resolvers: `onmatch`, `resolve`
* [ ] `m.route.SKIP` constant: skip redraw in specific scenarios
* [X] Route redraws and route.link behavior

### HTTP & Utilities
* [X] `m.request` alias to Sin's fetch-based client
* [X] Query utilities: `parseQueryString`, `buildQueryString`

### Streams & Reactivity
* [ ] `m.stream` wrapping Sin reactive primitives
* [ ] Stream combinators: `map`, `scan`, `merge`, `mergeAll`
* [ ] Stream-lifecycle integration (auto cleanup)

### SSR
* [ ]  Build the ssr module to opt-in

### Testing & QA
* [~] Unit tests for each `m.*` shim
* [X] Integration tests with sample Mithril apps

## Quick Start

(To be added)

## Testing

The project uses Vitest for testing. The test suite is organized in the `tests/` directory and covers the core functionality of the Mithril to Sin bridge.

To run the test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Project Structure

```
mithril-bridge/
├── example/               # Example application.
├── tests/                 # Test suite.
└── src/
    ├── index.js           # Main entry point and public API.
    ├── lib.js             # Core implementation and utility functions.
    └── types.d.ts         # Typescript definitions.
```

### Key Directories

- `src/`: Contains the core implementation of the Mithril to Sin bridge

- `tests/`: Comprehensive test suite covering all major features
  - Each test file corresponds to a specific feature or component
  - Tests are written using Vitest and follow a consistent pattern

- `example/`: A working example application
  - Demonstrates how to use the bridge in a real application
  - Serves as both documentation and testing ground
