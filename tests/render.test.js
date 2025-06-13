import {describe, afterEach, beforeEach, test, expect, vi} from 'vitest';
import m from '../src/index';

describe('m.render', () => {
  let warnSpy;

  beforeEach(() => {
    // Clear out document.body before each test
    document.body.innerHTML = '';
    // Spy on console.warn for the “mounting to non‐body” warning
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('renders a simple <h1> into document.body (baseline)', () => {
    m.render(document.body, m('h1', 'hello world'));
    expect(document.body.innerHTML).toBe('<h1>hello world</h1>');
  });

  test('mounting to a non-body element emits a warning but still renders into document.body', () => {
    const fakeContainer = document.createElement('div');
    // Call m.render with fakeContainer instead of document.body
    m.render(fakeContainer, m('p', 'mounted to wrong element'));

    // Should have warned exactly once
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'mounting to other than document.body is not supported!!!'
    );

    // Even though we passed fakeContainer, the implementation still does s.mount(...)
    // which (in our environment) ends up writing into <body>.
    expect(document.body.innerHTML).toBe('<p>mounted to wrong element</p>');
  });

  test('redraw callback to a non-body element emits a warning but still renders into document.body', () => {
    m.render(document.body, m('h1', 'hello world'), () =>
      console.log('callback')
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'redraw callbacks are not currently supported!!!'
    );

    // Even though we passed callback, the implementation still does s.mount(...)
    // which (in our environment) ends up writing into <body>.
    expect(document.body.innerHTML).toBe('<h1>hello world</h1>');
  });

  test('renders nested vnodes (e.g. <ul><li>1</li><li>2</li></ul>) correctly', () => {
    const vnodeTree = m('ul', {id: 'my-list'}, [
      m('li', 'first'),
      m('li', 'second')
    ]);
    m.render(document.body, vnodeTree);

    // Expect the id attribute on <ul> and two <li> children
    expect(document.body.innerHTML).toBe(
      '<ul id="my-list"><li>first</li><li>second</li></ul>'
    );
  });

  test('renders attributes (e.g. class, data-*, etc.) correctly', () => {
    const vnodeWithAttrs = m(
      'button',
      {
        class: 'btn primary',
        'data-test': 'my-button',
        onclick: () => {
          /* no-op */
        }
      },
      'Click me'
    );
    m.render(document.body, vnodeWithAttrs);

    // innerHTML will include the class and data-test attributes.
    // Note: in jsdom, event listeners (onclick) do not show up as attributes in innerHTML.
    const html = document.body.innerHTML;

    // Check that the <button> tag contains class="btn primary" and data-test="my-button"
    expect(html).toContain('<button');
    expect(html).toContain('class="btn primary"');
    expect(html).toContain('data-test="my-button"');
    expect(html).toContain('>Click me</button>');
  });

  test('calling m.render twice replaces the old content', () => {
    // First render:
    m.render(document.body, m('span', 'first render'));
    expect(document.body.innerHTML).toBe('<span>first render</span>');

    // Second render with a completely different vnode:
    m.render(document.body, m('h2', 'second render'));
    expect(document.body.innerHTML).toBe('<h2>second render</h2>');
  });
});
