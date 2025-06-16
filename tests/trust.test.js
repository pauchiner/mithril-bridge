import {describe, it, expect} from 'vitest';
import m from '../src/index.js';

describe('m.trust', () => {
  it('should create a trusted vnode with raw HTML', () => {
    const html = '<span>Trusted Content</span>';
    const vnode = m.trust(html);

    expect(vnode).toBeDefined();
    expect(vnode.tag).toBe(null);
    expect(vnode.key).toBe(html);
    expect(vnode.attrs.key).toBe(html);
    expect(vnode.attrs.strings).toBe(html);
  });

  it('should allow setting raw HTML as children of an element', () => {
    const html = '<strong>Important</strong>';
    const vnode = m('div', m.trust(html));

    expect(vnode).toBeDefined();
    expect(vnode.children[0].tag).toBe(null);
    expect(vnode.children[0].key).toBe(html);
    expect(vnode.children[0].attrs.key).toBe(html);
    expect(vnode.children[0].attrs.strings).toBe(html);
  });

  it('should work with m.render', () => {
    const html = '<em>Italic</em>';
    const vnode = m('div', m.trust(html));

    m.render(document.body, vnode);
    expect(document.body.innerHTML).toBe(
      `<div><!--[2-->${html}<!--trust--></div>`
    );
  });

  it('should not escape HTML content', () => {
    const html = '<b>Bold</b>';
    const vnode = m('p', m.trust(html));

    m.render(document.body, vnode);

    expect(document.body.querySelector('b')).not.toBeNull();
    expect(document.body.innerHTML).toContain('<b>Bold</b>');
  });
});
