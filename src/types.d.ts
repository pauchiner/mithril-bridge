import type {View, Component, Children, Http} from 'sin';

/** This represents a key-value mapping linking routes to components. */
interface RouteDefs {
  /** The key represents the route. The value represents the corresponding component. */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [url: string]: any;
}

/** m.route.set options */
interface RouteOptions {
  /** Routing parameters. If path has routing parameter slots, the properties of this object are interpolated into the path string. */
  replace?: boolean;
  /** The state object to pass to the underlying history.pushState / history.replaceState call. */
  state?: Object;
  /** The title string to pass to the underlying history.pushState / history.replaceState call. */
  title?: string;
}

interface Route {
  /** Creates application routes and mounts Components and/or RouteResolvers to a DOM element. */
  (element: HTMLElement, defaultRoute: string, routes: RouteDefs): void;
  /** Redirects to a matching route or to the default route if no matching routes can be found. */
    set(path: string, params?: Object, options?: RouteOptions): void;
  /** Returns the last fully resolved routing path, without the prefix. */
  get(): string;
  /** Defines a router prefix which is a fragment of the URL that dictates the underlying strategy used by the router. */
  prefix: string;
  /** 
   * @summary This Component renders a link <a href> that will use the current routing strategy */
  Link: any;
  /**
   * @todo this function is not binded with sin.js, it will throw an error
   *
   * @summary Returns the named parameter value from the current route. */
  param(name: string): string;
  /**
   * @todo this function is not binded with sin.js, it will throw an error
   * @summary Gets all route parameters. */
  param(): any;
	}

interface Redraw {
  /** Manually triggers an asynchronous redraw of mounted components. */
  (): void;
  /** Force Redraw */
  force(): void;
  /** Manually triggers a synchronous redraw of mounted components. */
  sync(): void;
}

declare class Mithril {
    /**
     * Global Window Object
     */
    static readonly window: Window & typeof globalThis;
    /**
      * Scroll Restoration
      */
    static readonly scroll: boolean;
    /**
     * Check server
     */
    static readonly is: {
        /**
         * Whether or not code is executing on server.
         */
        server: boolean;
    };
    /**
     * Redrawing
     */
    static readonly redrawing: boolean;
    /**
     * JSX
     */
    static jsx: View;
    /**
     * Delay redraw or operation.
     *
     * @example
     *
     * // For in that sleep of death...
     * await sleep(2000)
     * // What dreams my come?
     */
    static sleep(x: number): Promise<number>;
    /**
     * Mithril Redraw
     */
    static redraw: Redraw;
    /**
     * Mithril Style
     *
     * Set the base `<style>` which sin uses.
     *
     * @example
     *
     * const style = document.createElement('style');
     *
     * m.style(style) // => HTMLStyleElement
     *
     * // Omitting parameter returns current <style> sin is using
     * m.style() // => HTMLStyleElement
     */
    static style: (element?: HTMLStyleElement) => HTMLStyleElement;
    /**
     * ### Events
     *
     * @example
     *
     * const sinned = m.event(x => console.log(x))
     *
     * m.observe('repent')
     */
    static event<T = any>(cb?: (x: T) => void): {
        /**
         * Observe event (Returns an unobserver callback function)
         */
        observe: (x: any, once: any) => () => boolean;
    };
    /**
     * Routing
     */
    static route: Route;
    /**
     * HTTP utility for requests
     *
     * @example
     *
     * s.request({
     *  url: '/api/path', 
     *  method: 'GET',
     *  redraw: true,
     *  responseType: 'json',
     *  json: 'application/json',
     *  query: {},
     *  body: {},
     *  user: '',
     *  pass: '',
     *  headers: {},
     *  timeout: 0,
     *  config: (xhr) => {},
     * })
     */
    static request: Http;
    /**
     * DOM Event listener - forwarded to `addEventListener`
     *
     * @example
     *
     * const { dom } = m("button", 'Click for atonement!');
     *
     * m.on(dom, 'click', (e) => {
     *
     *  // In the den of sin!
     *
     * }, {
     *  passive: true
     * })
     */
    static on: {
        <T extends HTMLElement, K extends keyof WindowEventMap = keyof WindowEventMap>(
        /**
         * The DOM Element listener will be attached
         */
        target: T, 
        /**
         * The event name
         */
        event: K, 
        /**
         * The listener callback function
         */
        listener: (this: Window, event: WindowEventMap[K]) => any, 
        /**
         * Event Options
         */
        options?: boolean | AddEventListenerOptions): void;
    };
    /**
     * Forgiving HTML or SVG string forms into unescaped HTML or SVG.
     *
     * > Unsanitized user input is **Forbidden!**
     *
     * @example
     *
     * m.trust(`<h1>Woe to the wicked!</h1>`)
     */
    static trust<T extends HTMLElement>(strings: string, ...values: string[]): T;
    /**
     * Error
     */
    static error(): Children;
}

declare namespace M {
  const View: View;
  const Component: Component;

  const Redraw: Redraw;
  const Request: Http;
  const Route: Route;
  /*
    const Live: Live;
    const Context: Context;

    const Render: Render;
    const Mount: Mount;
    const CSS: CSS;
    */
}

declare type Identity<T> = T;
declare const m: Identity<typeof Mithril> & Component;
declare module '@sin/mithril';

export { M, m as default };
