import s from 'sin';
import {
  component,
  isAttrs,
  mergeClass,
  flattenObj,
  compileSelector,
  computeSplatParams
} from './lib.js';

// Force the default prefix to avoid compatibility issues
s.route.prefix = '#!';

// Quick helpers for state between methods
m._REFRESH = {};
m._PARAMS = {};

function m(tag, attrs, ...children) {
  if (typeof tag === 'function' || (tag && typeof tag.view === 'function')) {
    return component.apply(this, [tag, attrs, children]);
  }

  const selector = compileSelector(tag);

  if (isAttrs(attrs)) {
    Object.assign(selector.attrs, attrs, mergeClass(selector.attrs, attrs));
  } else {
    if (attrs !== undefined) {
      children.unshift(attrs);
    }
  }

  return s(selector.tag, selector.attrs, ...children);
}

// Render
m.render = (element, vnodes, redraw) => {
  if (element && element !== window?.document?.body) {
    console.warn('mounting to other than document.body is not supported!!!');
  }

  if (redraw) {
    console.warn('redraw callbacks are not currently supported!!!');
  }

  return s.mount(() => vnodes);
};

// Mount
m.mount = (element, component) => {
  if (element && element !== window?.document?.body) {
    console.warn('mounting to other than document.body is not supported!!!');
  }
  return s.mount(() => m(component));
};

// Route
m.route = (_dom, path, routes) => {
  // If there's no hash in the URL yet, jump to our default path
  if (!window.location.hash) {
    m.route.set(path);
  }

  // Build a map of route → resolver function
  const resolvers = Object.entries(routes).reduce((map, [route, component]) => {
    if (route.includes('...')) {
      map[route] = () => {
        const params = computeSplatParams(route);
        const current = m.route.get();

        if (
          params &&
          Object.entries(params).length > 0 &&
          typeof m._PARAMS[current] !== 'object'
        ) {
          m._PARAMS[current] = params;
        }

        return m(component, params);
      };
      return map;
    }

    map[route] = attrs => {
      const params = m.censor(attrs, ['scroll']);
      const current = m.route.get();

      if (
        params &&
        Object.entries(params).length > 0 &&
        typeof m._PARAMS[current] !== 'object'
      ) {
        m._PARAMS[current] = params;
      }

      return m(component, params);
    };
    return map;
  }, {});

  // Add a catch-all that sends you back to defaultPath
  resolvers['/*'] = () => {
    m.route.set(path);
  };

  return s.mount((_attrs, _children, context) => {
    m._REFRESH = context.reload;
    return s('div', context.route(resolvers));
  });
};

m.route.set = (path, params = null, options = {}) => {
  const pathname = params !== null ? m.buildPathname(path, params) : path;

  s.route(pathname, {
    replace: options.replace ?? false,
    state: options.state ?? {}
  });

  if (options.title) {
    document.title = options.title;
  }
};

m.route.get = () => {
  if (s.route.location.hash === '') {
    return s.route.location.pathname;
  }

  // extract the data needed
  const route = s.route.location.hash;
  const prefix = m.route.prefix();

  // if the route containes contains prefix, parse it.
  if (prefix !== '' && route.startsWith(prefix)) {
    return route.slice(prefix.length);
  }

  // parse the default prefix
  return route.slice('#'.length);
};

m.route.Link = {
  view: vnode => {
    // Omit the used parameters from the rendered element - they are
    // internal. Also, censor the various lifecycle methods.
    //
    // We don't strip the other parameters because for convenience we
    // let them be specified in the selector as well.

    const child = m(
      vnode.attrs.selector || 'a',
      m.censor(vnode.attrs, ['options', 'params', 'selector', 'onclick']),
      vnode.children
    );
    let options;
    let onclick;
    let href;

    if (child.attrs.disabled === Boolean(child.attrs.disabled)) {
      child.attrs.href = null;
      child.attrs['aria-disabled'] = 'true';
    } else {
      options = vnode.attrs.options;
      onclick = vnode.attrs.onclick;
      // Easier to build it now to keep it isomorphic.
      href = m.buildPathname(child.attrs.href, vnode.attrs.params);
      child.attrs.href = s.route.prefix + href;
      child.attrs.onclick = e => {
        let result;
        if (typeof onclick === 'function') {
          result = onclick.call(e.currentTarget, e);
        } else if (onclick == null || typeof onclick !== 'object') {
          // do nothing
        } else if (typeof onclick.handleEvent === 'function') {
          onclick.handleEvent(e);
        }

        // Adapted from React Router's implementation:
        // https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
        //
        // Try to be flexible and intuitive in how we handle links.
        // Fun fact: links aren't as obvious to get right as you
        // would expect. There's a lot more valid ways to click a
        // link than this, and one might want to not simply click a
        // link, but right click or command-click it to copy the
        // link target, etc. Nope, this isn't just for blind people.
        if (
          // Skip if `onclick` prevented default
          result !== false &&
          !e.defaultPrevented &&
          // Ignore everything but left clicks
          (e.button === 0 || e.which === 0 || e.which === 1) &&
          // Let the browser handle `target=_blank`, etc.
          (!e.currentTarget.target || e.currentTarget.target === '_self') &&
          // No modifier keys
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          e.redraw = false;

          m.route.set(href, null, options);
          m._REFRESH();
        }
      };
    }
    return child;
  }
};

m.route.SKIP = () =>
  console.error('This property is not currently implemented!!!');

m.route.param = key => {
  const attrs = m._PARAMS[m.route.get()];
  return attrs && key !== null ? attrs[key] : attrs;
};

m.route.prefix = (prefix = null) => {
  if (prefix !== null) {
    s.route.prefix = prefix;
  }
  return s.route.prefix;
};

// Request
m.request = async (options = {}) => {
  // Parse the params & query stuff
  if (options.params) {
    options.query = flattenObj(params);
    // biome-ignore lint/performance/noDelete: mithril legacy code, can be destructured if a future
    delete options.params;
  }

  // Allow custom config functions
  if (typeof options.config === 'function') {
    options.config = xhr => {
      xhr.withCredentials = true;
      return options.config(xhr) || xhr;
    };
  } else {
    options.config = xhr => {
      xhr.withCredentials = true;
      return xhr;
    };
  }

  // Allow custom extract functions
  if (typeof options.extract === 'function') {
    const response = await s.http(options.url, options).xhr;
    const result = options.extract(response);
    s.redraw();

    return result;
  }

  return s.http(options.url, options);
};

// Query String
m.parseQueryString = query => {
  function decodeURIComponentSave(str) {
    try {
      return decodeURIComponent(str);
    } catch {
      return str;
    }
  }

  if (query === '' || query == null) {
    return {};
  }
  if (query.charAt(0) === '?') {
    query = query.slice(1);
  }

  const entries = query.split('&');
  const counters = {};
  const data = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i].split('=');
    const key = decodeURIComponentSave(entry[0]);
    let value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : '';

    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    const levels = key.split(/\]\[?|\[/);
    let cursor = data;
    if (key.indexOf('[') > -1) {
      levels.pop();
    }
    for (let j = 0; j < levels.length; j++) {
      let level = levels[j];
      const nextLevel = levels[j + 1];
      const isNumber =
        nextLevel === '' || !Number.isNaN(Number.parseInt(nextLevel, 10));
      if (level === '') {
        const key = levels.slice(0, j).join();
        if (counters[key] == null) {
          counters[key] = Array.isArray(cursor) ? cursor.length : 0;
        }
        level = counters[key]++;
      }
      // Disallow direct prototype pollution
      else if (level === '__proto__') {
        break;
      }
      if (j === levels.length - 1) {
        cursor[level] = value;
      } else {
        // Read own properties exclusively to disallow indirect
        // prototype pollution
        let desc = Object.getOwnPropertyDescriptor(cursor, level);
        if (desc != null) {
          desc = desc.value;
        }
        if (desc == null) {
          cursor[level] = desc = isNumber ? [] : {};
        }
        cursor = desc;
      }
    }
  }
  return data;
};
m.buildQueryString = query => {
  if (Object.prototype.toString.call(query) !== '[object Object]') {
    return '';
  }

  const args = [];
  for (const key in query) {
    destructure(key, query[key]);
  }

  return args.join('&');

  function destructure(key, value) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        destructure(`${key}[${i}]`, value[i]);
      }
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      for (const i in value) {
        destructure(`${key}[${i}]`, value[i]);
      }
    } else {
      args.push(
        encodeURIComponent(key) +
          (value != null && value !== '' ? `=${encodeURIComponent(value)}` : '')
      );
    }
  }
};

// Pathname
m.parsePathname = url => {
  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const queryEnd = hashIndex < 0 ? url.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  let path = url.slice(0, pathEnd).replace(/\/{2,}/g, '/');

  if (!path) {
    path = '/';
  } else {
    if (path[0] !== '/') {
      path = `/${path}`;
    }
  }
  return {
    path: path,
    params:
      queryIndex < 0
        ? {}
        : m.parseQueryString(url.slice(queryIndex + 1, queryEnd))
  };
};
m.buildPathname = (template, params) => {
  if (/:([^\/\.-]+)(\.{3})?:/.test(template)) {
    throw new SyntaxError(
      "Template parameter names must be separated by either a '/', '-', or '.'."
    );
  }
  if (params == null) {
    return template;
  }
  const queryIndex = template.indexOf('?');
  const hashIndex = template.indexOf('#');
  const queryEnd = hashIndex < 0 ? template.length : hashIndex;
  const pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
  const path = template.slice(0, pathEnd);
  const query = {};

  Object.assign(query, params);

  const resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, (m, key, variadic) => {
    delete query[key];
    // If no such parameter exists, don't interpolate it.
    if (params[key] == null) {
      return m;
    }
    // Escape normal parameters, but not variadic ones.
    return variadic ? params[key] : encodeURIComponent(String(params[key]));
  });

  // In case the template substitution adds new query/hash parameters.
  const newQueryIndex = resolved.indexOf('?');
  const newHashIndex = resolved.indexOf('#');
  const newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
  const newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
  let result = resolved.slice(0, newPathEnd);

  if (queryIndex >= 0) {
    result += template.slice(queryIndex, queryEnd);
  }
  if (newQueryIndex >= 0) {
    result +=
      (queryIndex < 0 ? '?' : '&') + resolved.slice(newQueryIndex, newQueryEnd);
  }
  const querystring = m.buildQueryString(query);
  if (querystring) {
    result += (queryIndex < 0 && newQueryIndex < 0 ? '?' : '&') + querystring;
  }
  if (hashIndex >= 0) {
    result += template.slice(hashIndex);
  }
  if (newHashIndex >= 0) {
    result += (hashIndex < 0 ? '' : '&') + resolved.slice(newHashIndex);
  }
  return result;
};

// Redraw
m.redraw = s.redraw;
// Override the call for compatibility
m.redraw.sync = s.redraw;

// Trust
m.trust = html => {
  if (html === undefined) {
    return;
  }
  return s.trust(html);
};

// Fragment
m.fragment = (attrs, children) => {
  if (children !== undefined) {
    return s`[`(attrs, children);
  }

  return s`[`(attrs);
};

//Censor
m.censor = (attrs, extras) => {
  const regex =
    /^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$/;
  const hasOwn = {}.hasOwnProperty;
  const result = {};

  if (extras != null) {
    for (const key in attrs) {
      if (
        hasOwn.call(attrs, key) &&
        !regex.test(key) &&
        extras.indexOf(key) < 0
      ) {
        result[key] = attrs[key];
      }
    }
  } else {
    for (const key in attrs) {
      if (hasOwn.call(attrs, key) && !regex.test(key)) {
        result[key] = attrs[key];
      }
    }
  }

  return result;
};

export default m;
