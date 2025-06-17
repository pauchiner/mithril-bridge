import {describe, it, expect} from 'vitest';
import m from '../src/index.js';

describe('m.censor', () => {
  it('removes all lifecycle hooks and `key`, but keeps other attributes', () => {
    const original = {
      id: 'foo',
      key: 'bar',
      className: 'baz',
      oncreate: () => {},
      onupdate: () => {},
      onbeforeupdate: () => {},
      onremove: () => {},
      onbeforeremove: () => {},
      oninit: () => {}
    };

    const censored = m.censor(original);

    expect(censored).toStrictEqual({id: 'foo', className: 'baz'});

    // original object is not mutated
    expect(original.key).toBe('bar');
    expect(typeof original.oncreate).toBe('function');
  });

  it('returns an empty object when given only censored props', () => {
    const onlyHooks = {
      key: 123,
      onremove: () => {},
      onupdate: () => {}
    };
    const result = m.censor(onlyHooks);
    expect(result).toEqual({});
  });

  it('does not throw if passed an empty object', () => {
    expect(() => m.censor({})).not.toThrow();
    expect(m.censor({})).toEqual({});
  });
});
