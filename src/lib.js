import s from 'sin';

/**
 * Checks whether the given value should be treated as a Mithril attrs object.
 *
 * @param {*} x  - The value to test.
 * @returns {boolean}  True if `x` is a valid attrs object, false otherwise.
 */
export const isAttrs = (x) => {
  return x && typeof x === 'object' && x instanceof Date === false
    && Array.isArray(x) === false && x instanceof s.View === false
}

/**
 * Merges two `class` attribute values (strings, arrays, or objects) into one.
 *
 * @param {string|Array|string|Object} a  - First class value.
 * @param {string|Array|string|Object} b  - Second class value.
 * @returns {string}  A space-separated string of all classes where the map is truthy.
 */
export const mergeClass = (a, b) => {
  return {
    className: (a.className ? a.className + ' ' : '') + (b.className || ''),
    class: (a.class ? a.class + ' ' : '') + (b.class || '')
  }
}

/**
 * Retrieves the dynamic parameters for a “splat” route segment (e.g. `/foo/:rest.../bar`).
 *
 * @param {string} pattern  - A URL pattern, e.g. "/posts/:postId/:sections..."
 * @returns {Object|null}   An object mapping param names → values, or null if no match.
 */
export const computeSplatParams = pattern => {
  const currentRoute = m.route.get();

  const routeSegs = currentRoute.split('/').filter(Boolean);
  const patternSegs = pattern.split('/').filter(Boolean);
  const params = {};

  let r = 0; // index into routeSegs

  for (let p = 0; p < patternSegs.length; p++) {
    const seg = patternSegs[p];

    // Splat parameters
    if (seg.startsWith(':') && seg.endsWith('...')) {
      const name = seg.slice(1, -3);              // "sections"
      const remainingPatterns = patternSegs.length - p - 1;
      const available = routeSegs.length - r;

      // If too few segments to satisfy the rest of the pattern, no match
      if (available < remainingPatterns) return {};

      // Consume just enough to leave room for post-splat segments
      const splatCount = available - remainingPatterns;
      params[name] = routeSegs.slice(r, r + splatCount).join('/');
      r += splatCount;
      continue;
    }

    // Named parameters
    if (seg.startsWith(':')) {
      if (r >= routeSegs.length) return {};  // missing segment
      const name = seg.slice(1);
      params[name] = routeSegs[r++];
      continue;
    }

    // Literal segment must match exactly
    if (r >= routeSegs.length || routeSegs[r] !== seg) {
      return {};
    }
    r++;
  }

  // Only match if we've consumed *all* of both arrays
  if (r === routeSegs.length && patternSegs.length === Object.keys(patternSegs).length) {
    return params;
  }

  // No match
  return {};
}

/**
 * Determines the proper `this` context for a component’s lifecycle methods.
 *
 * @param {Function|Object} caller  - Either the component function or an existing vnode.
 * @param {Object} vnode             - The vnode being constructed.
 * @returns {Object}                 The resolved vnode context.
 */
export const context = (caller, vnode) => {
  if (caller.prototype != null) {
    return vnode.state;
  }
  return vnode;
}

/**
 * Parses a CSS-style selector string into an object with tag, id, and class parts.
 * Supports things like `"div#main.content.large"`.
 *
 * @param {string} selector
 * @returns {{ tag: string, id?: string, className?: string }}
 *   - `tag` defaults to `"div"` if omitted.
 *   - `id` is extracted from `#…`
 *   - `className` is a space-separated list from `.` pieces.
 */
export const compileSelector = (selector) => {
  const selectorParser = /(?:(^|#|\.)([^#.[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
  const selectorCache = {}

  let match
    , tag = 'div'

  const classes = []
    , attrs = {}

  while ((match = selectorParser.exec(selector))) {
    const type = match[1]
      , value = match[2]
    if (type === '' && value !== '') {
      tag = value
    } else if (type === '#') {
      attrs.id = value
    } else if (type === '.') {
      classes.push(value)
    } else if (match[3][0] === '[') {
      let attrValue = match[6]
      if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, '$1').replace(/\\\\/g, '\\')
      if (match[4] === 'class') classes.push(attrValue)
      else attrs[match[4]] = attrValue === '' ? attrValue : attrValue || true
    }
  }
  if (classes.length > 0) attrs.className = classes.join(' ')
  return selectorCache[selector] = { tag, attrs }
}

/**
 * Wraps a user-defined Mithril-like component factory (or vnode descriptor)
 * into a vnode builder that handles attrs, children, lifecycle methods,
 *
 * @param {Function|Object} view
 * @param {Object|*} attrs
 * @param {...*} children
 *
 * @returns {Object} A Mithril vnode descriptor.
 */
export const component = (view, attrs, ...children) => {
  const lifecycleMethods = ["oninit", "oncreate", "onbeforeupdate", "onupdate", "onbeforeremove", "onremove"];

  let vnode = {
    attrs: {},
    children,
    dom: undefined,
    domSize: undefined,
    events: undefined,
    instance: undefined,
    key: undefined,
    state: {},
    tag: undefined,
    text: undefined,
  };

  function dom(element) {
    if (vnode.state.oncreate) {
      vnode.state.oncreate.call(context(vnode.state.oncreate, vnode), {
        ...vnode,
        dom: element,
      });
    }

    /*
    return async () => {
      if (vnode.state.onbeforeremove) {
        await vnode.state.onbeforeremove.call(context(vnode.state.onbeforeremove, vnode), {
          ...vnode,
          dom: element,
        });
      }
    */

    return () => {
      if (vnode.state.onremove) {
        vnode.state.onremove.call(context(vnode.state.onremove, vnode), {
          ...vnode,
          dom: element,
        });
      }
    };
  }

  /*  Injects a callback inside the vnode with the given name (used in the dom callback) */
  function injectDom(view) {
    if (!view || typeof view !== "object") return;
    if (!view.tag) return;

    view.attrs.dom = dom;
  }

  function build(_attrs, _children, { ignore }) {
    // Compute the component attributes
    if (isAttrs(attrs)) {
      Object.assign(vnode.attrs, attrs);
    } else {
      if (attrs !== undefined) vnode.children.unshift(attrs);
    }

    // Call the user’s component factory (or vnode constructor).
    if (typeof view === "function") {
      vnode.tag = view;
      vnode.state = view.apply(vnode, [{ ...vnode }]);

      // Forward lifecycle method inside attributes (used to override methods outside components)
      Object.keys(vnode.attrs).forEach(attr => {
        if (lifecycleMethods.some(method => method === attr)) {
          vnode.state[attr] = vnode.attrs[attr];
        }
      });
    } else {
      vnode.state = view
      vnode.tag = { view: view.view };
    }

    // Setup vnode keys
    if (vnode.attrs?.key) {
      vnode.key = vnode.attrs.key
    }

    // Call `oninit` lifecycle if defined
    if (vnode.state.oninit) {
      vnode.state.oninit.call(context(vnode.state.oninit, vnode), vnode);
    }

    // Return the view‐function wrapper.
    // (Here we merge the attributes and children)
    return (data) => {
      /* This `data` return needs to be diffed in order to get only the attrs and not the children */

      // TODO: THIS IS DUE TO A PROBLEM WITH CHILDREN FILTERING (QUICK FIX WITH 0 objects)
      Object.entries(data).forEach(([key, value]) => {
        if(value instanceof s.View) return;

        if (key !== '0') {
          vnode.attrs[key] = value
        }
      });

      const components = vnode.state.view.call(
        context(vnode.state.view, vnode),
        vnode
      );

      // Handle the `onbeforeupdate` lifecycle
      if (vnode.state.onbeforeupdate && typeof vnode.state.onbeforeupdate === 'function') {
        ignore(vnode.state.onbeforeupdate() === false);
      }

      // Handle the `onupdate` lifecycle
      if (vnode.state.onupdate) {
        vnode.state.onupdate.call(context(vnode.state.onupdate, vnode), vnode);
      }

      // We inject the dom method into attrs to force the execution of `oncreate` and `onremove`
      if (Array.isArray(components)) {
        components.forEach(injectDom);
      } else {
        injectDom(components)
      }

      return components;
    }
  }

  return s(build)({ ...attrs, ...children });
}

/**
 * Flattens a nested object into a single-level object by prefixing keys.
 *
 * @param {Object} obj
 * @param {string} [prefix=""]  - Prefix to prepend to all keys (no trailing dot).
 * @returns {Object}            A new flattened object.
 */
export const flattenObj = (obj, prefix = "") => {
  if (!obj) return {};
  const res = {};
  Object.keys(obj).forEach((key) => {
    const v = obj[key];
    if (typeof v === "object" && v !== null) {
      Object.assign(
        res,
        flattenObj(v, prefix ? `${prefix}[${key}]` : key)
      );
    } else {
      res[prefix ? `${prefix}[${key}]` : key] = v;
    }
  });
  return res;
}
