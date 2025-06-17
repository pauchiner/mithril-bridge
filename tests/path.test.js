import {describe, it, expect} from 'vitest';
import m from '../src/index.js';

describe('m.m.buildPathname', () => {
  function test(prefix) {
    it('throws with an invalid syntax', () => {
      expect(() => m.buildPathname(':myparam...:')).toThrowError(
        "Template parameter names must be separated by either a '/', '-', or '.'."
      );
    });

    it('returns path if no params', () => {
      const string = m.buildPathname(`${prefix}/route/foo`, undefined);
      expect(string).toBe(`${prefix}/route/foo`);
    });

    it('skips interpolation if no params', () => {
      const string = m.buildPathname(`${prefix}/route/:id`, undefined);
      expect(string).toBe(`${prefix}/route/:id`);
    });

    it('appends query strings', () => {
      const string = m.buildPathname(`${prefix}/route/foo`, {a: 'b', c: 1});
      expect(string).toBe(`${prefix}/route/foo?a=b&c=1`);
    });

    it('inserts template parameters at end', () => {
      const string = m.buildPathname(`${prefix}/route/:id`, {id: '1'});
      expect(string).toBe(`${prefix}/route/1`);
    });

    it('inserts template parameters at beginning', () => {
      const string = m.buildPathname(`${prefix}/:id/foo`, {id: '1'});
      expect(string).toBe(`${prefix}/1/foo`);
    });

    it('inserts template parameters at middle', () => {
      const string = m.buildPathname(`${prefix}/route/:id/foo`, {id: '1'});
      expect(string).toBe(`${prefix}/route/1/foo`);
    });

    it('inserts variadic paths', () => {
      const string = m.buildPathname(`${prefix}/route/:foo...`, {foo: 'id/1'});
      expect(string).toBe(`${prefix}/route/id/1`);
    });

    it('inserts variadic paths with initial slashes', () => {
      const string = m.buildPathname(`${prefix}/route/:foo...`, {foo: '/id/1'});
      expect(string).toBe(`${prefix}/route//id/1`);
    });

    it('skips template parameters at end if param missing', () => {
      const string = m.buildPathname(`${prefix}/route/:id`, {param: 1});
      expect(string).toBe(`${prefix}/route/:id?param=1`);
    });

    it('skips template parameters at beginning if param missing', () => {
      const string = m.buildPathname(`${prefix}/:id/foo`, {param: 1});
      expect(string).toBe(`${prefix}/:id/foo?param=1`);
    });

    it('skips template parameters at middle if param missing', () => {
      const string = m.buildPathname(`${prefix}/route/:id/foo`, {param: 1});
      expect(string).toBe(`${prefix}/route/:id/foo?param=1`);
    });

    it('skips variadic template parameters if param missing', () => {
      const string = m.buildPathname(`${prefix}/route/:foo...`, {
        param: '/id/1'
      });
      expect(string).toBe(`${prefix}/route/:foo...?param=%2Fid%2F1`);
    });

    it('handles escaped values', () => {
      const data = m.buildPathname(`${prefix}/route/:foo`, {
        foo: ';:@&=+$,/?%#'
      });
      const encoded = encodeURIComponent(';:@&=+$,/?%#');
      expect(data).toBe(`${prefix}/route/${encoded}`);
    });

    it('handles unicode', () => {
      const data = m.buildPathname(`${prefix}/route/:ö`, {ö: 'ö'});
      const encoded = encodeURIComponent('ö');
      expect(data).toBe(`${prefix}/route/${encoded}`);
    });

    it('handles zero', () => {
      const string = m.buildPathname(`${prefix}/route/:a`, {a: 0});
      expect(string).toBe(`${prefix}/route/0`);
    });

    it('handles false', () => {
      const string = m.buildPathname(`${prefix}/route/:a`, {a: false});
      expect(string).toBe(`${prefix}/route/false`);
    });

    it('handles dashes', () => {
      const string = m.buildPathname(`${prefix}/:lang-:region/route`, {
        lang: 'en',
        region: 'US'
      });
      expect(string).toBe(`${prefix}/en-US/route`);
    });

    it('handles dots', () => {
      const string = m.buildPathname(`${prefix}/:file.:ext/view`, {
        file: 'image',
        ext: 'png'
      });
      expect(string).toBe(`${prefix}/image.png/view`);
    });

    it('merges query strings', () => {
      const string = m.buildPathname(`${prefix}/item?a=1&b=2`, {c: 3});
      expect(string).toBe(`${prefix}/item?a=1&b=2&c=3`);
    });

    it('merges query strings with other parameters', () => {
      const string = m.buildPathname(`${prefix}/item/:id?a=1&b=2`, {
        id: 'foo',
        c: 3
      });
      expect(string).toBe(`${prefix}/item/foo?a=1&b=2&c=3`);
    });

    it('consumes template parameters without modifying query string', () => {
      const string = m.buildPathname(`${prefix}/item/:id?a=1&b=2`, {id: 'foo'});
      expect(string).toBe(`${prefix}/item/foo?a=1&b=2`);
    });
  }

  describe('absolute', () => {
    test('');
  });
  describe('relative', () => {
    test('..');
  });
  describe('absolute + domain', () => {
    test('https://example.com');
  });
  describe('absolute + `file:`', () => {
    test('file://');
  });
});

describe('m.m.parsePathname', () => {
  it('parses empty string', () => {
    const data = m.parsePathname('');
    expect(data).toEqual({path: '/', params: {}});
  });

  it('parses query at start', () => {
    const data = m.parsePathname('?a=b&c=d');
    expect(data).toEqual({path: '/', params: {a: 'b', c: 'd'}});
  });

  it('ignores hash at start', () => {
    const data = m.parsePathname('#a=b&c=d');
    expect(data).toEqual({path: '/', params: {}});
  });

  it('parses query and ignores hash at start', () => {
    const data = m.parsePathname('?a=1&b=2#c=3&d=4');
    expect(data).toEqual({path: '/', params: {a: '1', b: '2'}});
  });

  it('parses root', () => {
    const data = m.parsePathname('/');
    expect(data).toEqual({path: '/', params: {}});
  });

  it('parses root + query', () => {
    const data = m.parsePathname('/?a=b&c=d');
    expect(data).toEqual({path: '/', params: {a: 'b', c: 'd'}});
  });

  it('parses root and ignores hash', () => {
    const data = m.parsePathname('/#a=b&c=d');
    expect(data).toEqual({path: '/', params: {}});
  });

  it('parses root + query and ignores hash', () => {
    const data = m.parsePathname('/?a=1&b=2#c=3&d=4');
    expect(data).toEqual({path: '/', params: {a: '1', b: '2'}});
  });

  it('parses route', () => {
    const data = m.parsePathname('/route/foo');
    expect(data).toEqual({path: '/route/foo', params: {}});
  });

  it('parses route + empty query', () => {
    const data = m.parsePathname('/route/foo?');
    expect(data).toEqual({path: '/route/foo', params: {}});
  });

  it('parses route + empty query + empty hash', () => {
    const data = m.parsePathname('/route/foo?#');
    expect(data).toEqual({path: '/route/foo', params: {}});
  });

  it('parses route + query', () => {
    const data = m.parsePathname('/route/foo?a=1&b=2');
    expect(data).toEqual({path: '/route/foo', params: {a: '1', b: '2'}});
  });

  it('parses route + query and ignores hash', () => {
    const data = m.parsePathname('/route/foo?a=1&b=2#c=3&d=4');
    expect(data).toEqual({path: '/route/foo', params: {a: '1', b: '2'}});
  });

  it('normalizes slashes and ignores hash', () => {
    const data = m.parsePathname('//route/////foo//?a=1&b=2#c=3&d=4');
    expect(data).toEqual({path: '/route/foo/', params: {a: '1', b: '2'}});
  });

  it("doesn't comprehend protocols", () => {
    const data = m.parsePathname('https://example.com/foo/bar');
    expect(data).toEqual({path: '/https:/example.com/foo/bar', params: {}});
  });
});
