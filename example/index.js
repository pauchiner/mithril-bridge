import m from '../src/index';

const Content = {
  view: () =>
    m(
      'article',
      {
        style: {
          rowGap: '1rem',
          display: 'flex',
          columnGap: '2rem',
          textAlign: 'start',
          alignItems: 'center',
          flexDirection: 'column',
          gridRowStart: 2
        }
      },
      [
        m('section', { style: { marginBottom: '1rem' } }, [
          m(
            'h1',
            { style: { marginBottom: '1rem', fontSize: '2.4rem' } },
            'Mithril + Sin'
          ),
          m('p', 'By Digital Value')
        ]),
        m('section', [
          m(
            'ol',
            {
              style: {
                color: '#666',
                gap: '0.6rem',
                display: 'flex',
                marginLeft: '1rem',
                fontSize: '0.9rem',
                flexDirection: 'column'
              }
            },
            [
              m('li', 'Get started by editing index.js.'),
              m('li', 'Save and see your changes instantly.')
            ]
          )
        ])
      ]
    )
};

const Footer = {
  view: () =>
    m(
      'footer',
      {
        style: {
          gap: '2rem',
          display: 'flex',
          flexdirection: 'row',
          gridRowStart: 3
        }
      },
      [
        m(Link, { href: 'https://mithril.js.org/simple-application.html' }, [
          m(
            'svg',
            {
              fill: 'none',
              width: '1rem',
              height: '1rem',
              viewBox: '0 0 16 16',
              xmlns: 'http://www.w3.org/2000/svg'
            },
            m('path', {
              d: 'M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z',
              'clip-rule': 'evenodd',
              fill: '#666',
              'fill-rule': 'evenodd'
            })
          ),
          m('span', 'Learn')
        ]),
        m(Link, { href: 'https://mithril.js.org/examples.html' }, [
          m(
            'svg',
            {
              width: '1rem',
              height: '1rem',
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 16 16'
            },
            m('path', {
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: 'M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5',
              fill: '#666'
            })
          ),
          m('span', 'Examples')
        ]),
        m(Link, { href: 'https://mithril.js.org' }, [
          m(
            'svg',
            {
              width: '1rem',
              height: '1rem',
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 16 16'
            },
            [
              m(
                'g',
                { 'clip-path': 'url(#a)' },
                m('path', {
                  'fill-rule': 'evenodd',
                  'clip-rule': 'evenodd',
                  d: 'M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1',
                  fill: '#666'
                })
              ),
              m(
                'defs',
                m(
                  'clipPath',
                  { id: 'a' },
                  m('path', { fill: '#fff', d: 'M0 0h16v16H0z' })
                )
              )
            ]
          ),
          m('span', 'Go to mithril.js.org →')
        ])
      ]
    )
};

const Link = () => {
  let hover = false;

  return {
    view: vnode => [
      m(
        'a',
        {
          onmouseenter: () => {
            hover = true;
          },
          onmouseleave: () => {
            hover = false;
          },
          style: {
            gap: '0.5rem',
            display: 'flex',
            fontSize: '1rem',
            alignItems: 'center',
            transition: 'color 0.2s',
            textUnderlineOffset: '0.3rem',
            color: hover ? 'black' : '#666',
            textDecoration: hover ? 'underline' : 'none'
          },
          ...vnode.attrs
        },
        vnode.children
      )
    ]
  };
};

m.route(document.body, '/', {
  '/': { view: () => m('main', [m(Content), m(Footer)]) }
});
