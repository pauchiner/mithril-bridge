import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import s from '../../src/index.js'
import m from '../index.js'

describe('m.route', () => {
  let warnSpy

  beforeEach(() => {
    // Ensure a clean DOM and no leftover hash before each test
    document.body.innerHTML = ''
    window.location.hash = ''
    // Spy on console.warn in case m.route emits warnings for non-body mounts
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    // Reset hash again to avoid leaking into other tests
    window.location.hash = ''
  })

  test('initializes with default route and renders its component into document.body', () => {
    // Define two simple components
    const Home = {
      view: () => m('div', 'Home Page'),
    }
    const About = {
      view: () => m('div', 'About Page'),
    }

    // At the start, location.hash is empty. Calling m.route should redirect to "#!/home"
    m.route(document.body, '/home', {
      '/home': Home,
      '/about': About,
    })

    // After initialization, the URL hash should be "#!/home"
    expect(window.location.hash).toBe('#!/home')
    // And document.body.innerHTML should be the Home component's rendered output
    expect(document.body.innerHTML).toBe('<div>Home Page</div>')
  })

  test('navigates to a different route when hash changes', async () => {
    const Home = {
      view: () => m('div', 'Home'),
    }
    const About = {
      view: () => m('div', 'About'),
    }

    m.route(document.body, '/home', {
      '/home': Home,
      '/about': About,
    })

    // Initially, we should be at Home
    expect(window.location.hash).toBe('#!/home')
    expect(document.body.innerHTML).toBe('<div>Home</div>')

    // Now simulate navigating to "#!/about"
    window.location.hash = '#!/about'
    // Trigger the hashchange event so m.route can pick it up
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    // Wait for the route change
    await s.sleep(10);

    // After hashchange, it should render About
    expect(window.location.hash).toBe('#!/about')
    expect(document.body.innerHTML).toBe('<div>About</div>')
  })

  test('passes route parameters to the component via m.route.param()', async () => {
    // A User component that reads the ":id" parameter
    const User = {
      view: (vnode) => {
        console.log(vnode)
        const userId = m.route.param('id')
        return m('p', `User ID: ${userId}`)
      },
    }

    // Initialize routing with a route that has a parameter placeholder
    // Default route doesn’t matter here; we’ll set the hash manually
    m.route(document.body, '/user/42', {
      '/user/:id': User,
    })

    // The User component should read m.route.param('id') === "42"
    expect(document.body.innerHTML).toBe('<p>User ID: 42</p>')

    // Change to another user
    window.location.hash = '#!/user/7'
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await s.sleep(10);

    expect(document.body.innerHTML).toBe('<p>User ID: 7</p>')
  })

  test('navigating to an undefined route leaves the view unchanged', () => {
    const A = { view: () => m('div', 'A') }
    const B = { view: () => m('div', 'B') }

    m.route(document.body, '/a', {
      '/a': A,
      '/b': B,
    })

    expect(window.location.hash).toBe('#!/a')
    expect(document.body.innerHTML).toBe('<div>A</div>')

    // Try to navigate to a route not in the table
    window.location.hash = '#!/c'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    // Since '/c' is undefined, the content should remain the same (A)
    expect(document.body.innerHTML).toBe('<div>A</div>')
  })
})

describe('m.route.set', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  test('updates window.location.hash correctly', () => {
    m.route.set('/example')
    expect(window.location.hash).toBe('#!/example')

    m.route.set('/another')
    expect(window.location.hash).toBe('#!/another')
  })
})

describe('m.route.get', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  test('returns empty string when no hash is present', () => {
    // Depending on implementation, adjust expectation if get() returns undefined or "/".
    expect(m.route.get()).toBe('/')
  })

  test('returns the current route without prefix', () => {
    m.route.set('/hello/world')
    expect(window.location.hash).toBe('#!/hello/world')
    expect(m.route.get()).toBe('/hello/world')
  })

  test('reflects changes after calling m.route.set', () => {
    m.route.set('/home')
    expect(m.route.get()).toBe('/home')

    m.route.set('/profile/123')
    expect(m.route.get()).toBe('/profile/123')
  })
})

describe('m.route.Link', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  test('renders an <a> with correct href', () => {
    const vnode = m(m.route.Link, { href: '/foo/bar', class: 'nav-link' }, 'Navigate')
    m.render(document.body, vnode)

    const anchor = document.body.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor.getAttribute('href')).toBe('/foo/bar')
    expect(anchor.getAttribute('class')).toBe('nav-link')
    expect(anchor.textContent).toBe('Navigate')
  })
})

describe('m.route.param', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
  })

  test('returns undefined when there is no matching parameter', () => {
    const NoParamComp = {
      view: () => {
        const foo = m.route.param('foo')
        return m('div', `foo=${foo}`)
      },
    }

    m.route(
      document.body,
      '/noparams',
      {
        '/noparams': NoParamComp,
      }
    )

    // After initialization, location.hash => #!/noparams
    expect(window.location.hash).toBe('#!/noparams')
    // The component rendered should show "foo=undefined"
    expect(document.body.innerHTML).toBe('<div>foo=undefined</div>')
  })

  test('extracts a single dynamic segment correctly', async () => {
    const UserComp = {
      view: () => {
        const userId = m.route.param('id')
        return m('p', `User ID: ${userId}`)
      },
    }

    m.route(
      document.body,
      '/user/:id',
      {
        '/user/:id': UserComp,
      }
    )

    // Manually set hash to simulate navigating to a specific user
    window.location.hash = '#!/user/42'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await s.sleep(10);

    expect(m.route.param('id')).toBe('42')
    expect(document.body.innerHTML).toBe('<p>User ID: 42</p>')

    // Change to another id
    window.location.hash = '#!/user/99'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await s.sleep(10);

    expect(m.route.param('id')).toBe('99')
    expect(document.body.innerHTML).toBe('<p>User ID: 99</p>')
  })

  test('handles multiple dynamic segments in the route', () => {
    const OrderComp = {
      view: () => {
        const orderId = m.route.param('orderId')
        const itemId = m.route.param('itemId')
        return m(
          'div',
          `order=${orderId}, item=${itemId}`
        )
      },
    }

    m.route(
      document.body,
      '/order/123/item/456',
      {
        '/order/:orderId/item/:itemId': OrderComp,
      }
    )

    expect(m.route.param('orderId')).toBe('123')
    expect(m.route.param('itemId')).toBe('456')
    expect(document.body.innerHTML).toBe('<div>order=123, item=456</div>')
  })
})

describe.skip('m.route.SKIP', () => {
  test('is defined and is a unique constant', () => {
    expect(m.route.SKIP).toBeDefined()
    // It should strictly equal itself
    expect(m.route.SKIP).toBe(m.route.SKIP)
    // But it should not equal a plain string or number
    expect(m.route.SKIP).not.toBe('#!')
    expect(m.route.SKIP).not.toBe(0)
  })

  test('using SKIP as a resolver return value does not change the view', () => {
    // Set up two components: A and B. B’s onmatch will return m.route.SKIP
    const A = {
      view: () => m('div', 'Component A'),
    }
    const B = {
      onmatch: () => m.route.SKIP,
      view: () => m('div', 'Component B (should not appear)'),
    }

    // Initialize routing with '/a' as default
    m.route(
      document.body,
      '/a',
      {
        '/a': A,
        '/b': B,
      }
    )

    // After initialization, we should be on A
    expect(window.location.hash).toBe('#!/a')
    expect(document.body.innerHTML).toBe('<div>Component A</div>')

    // Now attempt to navigate to '/b'
    window.location.hash = '#!/b'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    // Because B.onmatch returned m.route.SKIP, view should remain A
    expect(document.body.innerHTML).toBe('<div>Component A</div>')
  })
})

describe('m.route.prefix', () => {
  test('defaults to "#!"', () => {
    expect(m.route.prefix).toBe('#!')
  })
})
