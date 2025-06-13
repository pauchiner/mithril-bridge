import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import m from '../index'

describe('m.mount', () => {
  let warnSpy

  beforeEach(() => {
    // Clear document.body before each test
    document.body.innerHTML = ''
    // Spy on console.warn
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  test('mounts a simple component into document.body', () => {
    const HelloComp = {
      view: () => m('h1', 'Hello, world!')
    }

    m.mount(document.body, HelloComp)
    expect(document.body.innerHTML).toBe('<h1>Hello, world!</h1>')
  })

  test('mounting to a non-body element emits a warning but still renders to document.body', () => {
    const fakeContainer = document.createElement('div')
    const MsgComp = {
      view: () => m('p', 'Mounted to wrong element')
    }

    m.mount(fakeContainer, MsgComp)

    // Warning should have been called once with the exact message
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      'mounting to other than document.body is not supported!!!'
    )

    // The content should still end up in document.body
    expect(document.body.innerHTML).toBe('<p>Mounted to wrong element</p>')
  })

  test('mounting a component twice replaces the old content', () => {
    const FirstComp = {
      view: () => m('span', 'First')
    }
    const SecondComp = {
      view: () => m('span', 'Second')
    }

    // First mount
    m.mount(document.body, FirstComp)
    expect(document.body.innerHTML).toBe('<span>First</span>')

    // Second mount (should replace the DOM)
    m.mount(document.body, SecondComp)
    expect(document.body.innerHTML).toBe('<span>Second</span>')
  })

  test('mounting a component with nested vnodes renders correctly', () => {
    const ListComp = {
      view: () =>
        m('ul', { class: 'my-list' }, [
          m('li', 'Item A'),
          m('li', 'Item B'),
          m('li', 'Item C'),
        ]),
    }

    m.mount(document.body, ListComp)
    expect(document.body.innerHTML).toBe(
      '<ul class="my-list"><li>Item A</li><li>Item B</li><li>Item C</li></ul>'
    )
  })

  test('mounting a component that uses attributes renders attributes correctly', () => {
    const ButtonComp = {
      view: () =>
        m(
          'button',
          { id: 'special-btn', 'data-role': 'action' },
          'Click Me'
        ),
    }

    m.mount(document.body, ButtonComp)
    const html = document.body.innerHTML

    expect(html).toContain('<button')
    expect(html).toContain('id="special-btn"')
    expect(html).toContain('data-role="action"')
    expect(html).toContain('>Click Me</button>')
  })

  test('if m.mount is called multiple times with different components, only the latest is rendered', () => {
    const FirstComp = {
      view: () => m('div', 'Component One')
    }
    const SecondComp = {
      view: () => m('div', 'Component Two')
    }
    const ThirdComp = {
      view: () => m('div', 'Component Three')
    }

    m.mount(document.body, FirstComp)
    expect(document.body.innerHTML).toBe('<div>Component One</div>')

    m.mount(document.body, SecondComp)
    expect(document.body.innerHTML).toBe('<div>Component Two</div>')

    m.mount(document.body, ThirdComp)
    expect(document.body.innerHTML).toBe('<div>Component Three</div>')
  })
})
