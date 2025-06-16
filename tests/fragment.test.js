import {describe, it, expect} from 'vitest';
import m from '../src/index.js';

describe('m.fragment', () => {
  it('creates a vnode with the fragment tag', () => {
    const vnode = m.fragment();
    expect(vnode.tag.name).toBe('[');
  });

  it('applies provided attributes correctly', () => {
    const attrs = {id: 'frag', class: 'test-class'};
    const vnode = m.fragment(attrs);
    expect(vnode.attrs).toEqual(attrs);
  });

  it('assigns children when provided', () => {
    const child = m('div', 'Hello');
    const vnode = m.fragment({}, child);
    expect(vnode.children[0]).toEqual(child);
  });

  it('defaults children to null when not provided', () => {
    const vnode = m.fragment({});
    expect(vnode.children).toStrictEqual([]);
  });
});
