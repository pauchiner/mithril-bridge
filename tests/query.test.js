import {it, describe, expect} from 'vitest';
import m from '../src/index.js';

describe('m.buildQueryString', () => {
  it('returns empty string for non-object inputs', () => {
    expect(m.buildQueryString(123)).toBe('');
    expect(m.buildQueryString(null)).toBe('');
    expect(m.buildQueryString('abc')).toBe('');
    expect(m.buildQueryString(undefined)).toBe('');
    expect(m.buildQueryString([1, 2, 3])).toBe('');
  });

  it('handles flat object', () => {
    const string = m.buildQueryString({a: 'b', c: 1});
    expect(string).toBe('a=b&c=1');
  });

  it('handles escaped values', () => {
    const key = ';:@&=+$,/?%#';
    const value = ';:@&=+$,/?%#';
    const encoded = encodeURIComponent(key);
    const string = m.buildQueryString({[key]: value});
    expect(string).toBe(`${encoded}=${encoded}`);
  });

  it('handles unicode', () => {
    const string = m.buildQueryString({ö: 'ö'});
    const encoded = encodeURIComponent('ö');
    expect(string).toBe(`${encoded}=${encoded}`);
  });

  it('handles nested object', () => {
    const string = m.buildQueryString({a: {b: 1, c: 2}});
    expect(string).toBe('a%5Bb%5D=1&a%5Bc%5D=2');
  });

  it('handles deep nested object', () => {
    const string = m.buildQueryString({a: {b: {c: 1, d: 2}}});
    expect(string).toBe('a%5Bb%5D%5Bc%5D=1&a%5Bb%5D%5Bd%5D=2');
  });

  it('handles nested array', () => {
    const string = m.buildQueryString({a: ['x', 'y']});
    expect(string).toBe('a%5B0%5D=x&a%5B1%5D=y');
  });

  it('handles array w/ dupe values', () => {
    const string = m.buildQueryString({a: ['x', 'x']});
    expect(string).toBe('a%5B0%5D=x&a%5B1%5D=x');
  });

  it('handles deep nested array', () => {
    const string = m.buildQueryString({a: [['x', 'y']]});
    expect(string).toBe('a%5B0%5D%5B0%5D=x&a%5B0%5D%5B1%5D=y');
  });

  it('handles deep nested array in object', () => {
    const string = m.buildQueryString({a: {b: ['x', 'y']}});
    expect(string).toBe('a%5Bb%5D%5B0%5D=x&a%5Bb%5D%5B1%5D=y');
  });

  it('handles deep nested object in array', () => {
    const string = m.buildQueryString({a: [{b: 1, c: 2}]});
    expect(string).toBe('a%5B0%5D%5Bb%5D=1&a%5B0%5D%5Bc%5D=2');
  });

  it('handles date', () => {
    const date = new Date(0);
    const string = m.buildQueryString({a: date});
    const expected = `a=${encodeURIComponent(date.toString())}`;
    expect(string).toBe(expected);
  });

  it('turns null into value-less string (like jQuery)', () => {
    const string = m.buildQueryString({a: null});
    expect(string).toBe('a');
  });

  it('turns undefined into value-less string (like jQuery)', () => {
    const string = m.buildQueryString({a: undefined});
    expect(string).toBe('a');
  });

  it('turns empty string into value-less string (like jQuery)', () => {
    const string = m.buildQueryString({a: ''});
    expect(string).toBe('a');
  });

  it('handles zero', () => {
    const string = m.buildQueryString({a: 0});
    expect(string).toBe('a=0');
  });

  it('handles false', () => {
    const string = m.buildQueryString({a: false});
    expect(string).toBe('a=false');
  });
});

describe('m.m.parseQueryString', () => {
 it('works with leading question mark', () => {
    const data = m.parseQueryString('?aaa=bbb')
    expect(data).toEqual({ aaa: 'bbb' })
  })

  it('parses empty string', () => {
    const data = m.parseQueryString('')
    expect(data).toEqual({})
  })

  it('parses flat object', () => {
    const data = m.parseQueryString('?a=b&c=d')
    expect(data).toEqual({ a: 'b', c: 'd' })
  })

  it('handles escaped values', () => {
    const key = ';:@&=+$,/?%#'
    const encoded = encodeURIComponent(key)
    const query = `?${encoded}=${encoded}`
    const data = m.parseQueryString(query)
    expect(data).toEqual({ [key]: key })
  })

  it('handles wrongly escaped values', () => {
    const input = '?test=%c5%a1%e8ZM%80%82H'
    const data = m.parseQueryString(input)
    expect(data).toEqual({ test: '%c5%a1%e8ZM%80%82H' })
  })

  it('handles escaped slashes followed by a number', () => {
    const data = m.parseQueryString('?hello=%2Fen%2F1')
    expect(data.hello).toBe('/en/1')
  })

  it('handles escaped square brackets', () => {
    const data = m.parseQueryString('?a%5B%5D=b')
    expect(data).toEqual({ a: ['b'] })
  })

  it('handles escaped unicode', () => {
    const data = m.parseQueryString('?%C3%B6=%C3%B6')
    expect(data).toEqual({ ö: 'ö' })
  })

  it('handles unicode without escaping', () => {
    const data = m.parseQueryString('?ö=ö')
    expect(data).toEqual({ ö: 'ö' })
  })

  it('parses without question mark', () => {
    const data = m.parseQueryString('a=b&c=d')
    expect(data).toEqual({ a: 'b', c: 'd' })
  })

  it('parses nested object', () => {
    const data = m.parseQueryString('a[b]=x&a[c]=y')
    expect(data).toEqual({ a: { b: 'x', c: 'y' } })
  })

  it('parses deep nested object', () => {
    const data = m.parseQueryString('a[b][c]=x&a[b][d]=y')
    expect(data).toEqual({ a: { b: { c: 'x', d: 'y' } } })
  })

  it('parses nested array', () => {
    const data = m.parseQueryString('a[0]=x&a[1]=y')
    expect(data).toEqual({ a: ['x', 'y'] })
  })

  it('parses deep nested array', () => {
    const data = m.parseQueryString('a[0][0]=x&a[0][1]=y')
    expect(data).toEqual({ a: [['x', 'y']] })
  })

  it('parses deep nested object in array', () => {
    const data = m.parseQueryString('a[0][c]=x&a[0][d]=y')
    expect(data).toEqual({ a: [{ c: 'x', d: 'y' }] })
  })

  it('parses deep nested array in object', () => {
    const data = m.parseQueryString('a[b][0]=x&a[b][1]=y')
    expect(data).toEqual({ a: { b: ['x', 'y'] } })
  })

  it('parses array without index', () => {
    const data = m.parseQueryString('a[]=x&a[]=y&b[]=w&b[]=z')
    expect(data).toEqual({ a: ['x', 'y'], b: ['w', 'z'] })
  })

  it('casts booleans', () => {
    const data = m.parseQueryString('a=true&b=false')
    expect(data).toEqual({ a: true, b: false })
  })

  it('does not cast numbers or other numeric formats', () => {
    const data = m.parseQueryString('a=1&b=-2.3&c=0x10&d=1e2&e=Infinity')
    expect(data).toEqual({ a: '1', b: '-2.3', c: '0x10', d: '1e2', e: 'Infinity' })
  })

  it('does not cast NaN', () => {
    const data = m.parseQueryString('a=NaN')
    expect(data.a).toBe('NaN')
  })

  it('does not cast date-like strings', () => {
    const data = m.parseQueryString('a=1970-01-01')
    expect(typeof data.a).toBe('string')
    expect(data.a).toBe('1970-01-01')
  })

  it('does not cast empty string or void', () => {
    expect(m.parseQueryString('a='))
      .toEqual({ a: '' })
    expect(m.parseQueryString('a'))
      .toEqual({ a: '' })
  })

  it('prefers later values for duplicate keys', () => {
    const data = m.parseQueryString('a=1&b=2&a=3')
    expect(data).toEqual({ a: '3', b: '2' })
  })

  it('does not pollute prototype directly, censors __proto__', () => {
    const prev = Object.prototype.toString
    const data = m.parseQueryString('a=b&__proto__%5BtoString%5D=123')
    expect(Object.prototype.toString).toBe(prev)
    expect(data).toEqual({ a: 'b' })
  })

  it('does not pollute prototype indirectly, retains constructor', () => {
    const prev = Object.prototype.toString
    const data = m.parseQueryString('a=b&constructor%5Bprototype%5D%5BtoString%5D=123')
    expect(Object.prototype.toString).toBe(prev)
    expect(Object.keys(data)).toEqual(['a', 'constructor'])
    expect(data.a).toBe('b')
    expect(data.constructor).toEqual({ prototype: { toString: '123' } })
  })
});
