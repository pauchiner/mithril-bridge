import {it, describe, expect} from 'vitest';
import m from '../src/index.js';

describe('m.buildQueryString', () => {
  it('should build a query string from a flat object', () => {
    const params = {foo: 'bar', baz: 42};
    const qs = m.buildQueryString(params);

    // Order of keys is not guaranteed, so split and compare as sets
    const parts = qs.split('&');
    expect(parts).toContain('foo=bar');
    expect(parts).toContain('baz=42');
  });

  it('should encode array values correctly', () => {
    const params = {colors: ['red', 'green', 'blue']};
    const qs = m.buildQueryString(params);
    expect(qs).toBe('colors%5B0%5D=red&colors%5B1%5D=green&colors%5B2%5D=blue');
  });

  it('should handle nested objects using bracket notation', () => {
    const params = {user: {name: 'Pau', age: 20}};
    const qs = m.buildQueryString(params);

    expect(qs).toBe('user%5Bname%5D=Pau&user%5Bage%5D=20');
  });

  it('should return an empty string for empty object', () => {
    expect(m.buildQueryString({})).toBe('');
  });
});

describe('m.parseQueryString', () => {
  it('should parse a simple query string into an object', () => {
    const qs = 'foo=bar&baz=42';
    const obj = m.parseQueryString(qs);
    expect(obj.foo).toBe('bar');
    expect(obj.baz).toBe('42');
  });

  it('should parse repeated keys into arrays', () => {
    const qs = 'colors%5B0%5D=red&colors%5B1%5D=green&colors%5B2%5D=blue';
    const obj = m.parseQueryString(qs);
    expect(Array.isArray(obj.colors)).toBe(true);
    expect(obj.colors).toEqual(['red', 'green', 'blue']);
  });

  it('should parse bracket notation into nested objects', () => {
    const qs = 'user[name]=Pau&user[age]=20';
    const obj = m.parseQueryString(qs);
    expect(obj.user).toBeDefined();
    expect(obj.user.name).toBe('Pau');
    expect(obj.user.age).toBe('20');
  });

  it('should return empty object for empty string', () => {
    expect(m.parseQueryString('')).toEqual({});
  });

  it('should decode encoded URI components', () => {
    const qs = 'greeting=hello%20world';
    const obj = m.parseQueryString(qs);
    expect(obj.greeting).toBe('hello world');
  });
});
