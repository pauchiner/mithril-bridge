import {describe, it, expect} from 'vitest';
import m from '../index';

describe('m.buildPathname', () => {
  it('builds a pathname from an object with only pathname', () => {
    const result = m.buildPathname('/test');
    expect(result).toBe('/test');
  });

  it('builds a pathname with query string', () => {
    const result = m.buildPathname('/test', {key: 'value'});
    expect(result).toBe('/test?key=value');
  });

  it('builds a pathname with empty parts', () => {
    const result = m.buildPathname('');
    expect(result).toBe('');
  });

  it('omits empty query', () => {
    const result = m.buildPathname('/test', {});
    expect(result).toBe('/test');
  });
});

describe('m.parsePathname', () => {
  it('parses a simple pathname', () => {
    const result = m.parsePathname('/test');
    expect(result).toEqual({
      path: '/test',
      params: {}
    });
  });

  it('parses pathname with query string', () => {
    const result = m.parsePathname('/test?key=value');
    expect(result).toEqual({
      path: '/test',
      params: {key: 'value'}
    });
  });

  it('parses only query string', () => {
    const result = m.parsePathname('?key=value');
    expect(result).toEqual({
      path: '/',
      params: {key: 'value'}
    });
  });

  it('parses empty string', () => {
    const result = m.parsePathname('');
    expect(result).toEqual({
      path: '/',
      params: {}
    });
  });
});
