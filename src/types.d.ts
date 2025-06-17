import type {Component, Http} from 'sin';

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
  state?: object;
  /** The title string to pass to the underlying history.pushState / history.replaceState call. */
  title?: string;
}

interface Route {
  /** Creates application routes and mounts Components and/or RouteResolvers to a DOM element. */
  (element: HTMLElement, defaultRoute: string, routes: RouteDefs): void;
  /** Redirects to a matching route or to the default route if no matching routes can be found. */
  set(path: string, params?: object, options?: RouteOptions): void;
  /** Returns the last fully resolved routing path, without the prefix. */
  get(): string;
  /** Defines a router prefix which is a fragment of the URL that dictates the underlying strategy used by the router. */
  prefix: string;
  /**
   * @summary This Component renders a link <a href> that will use the current routing strategy */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Link: any;
  /** @summary Returns the named parameter value from the current route. */
  param(name: string): string;
  /** @summary Gets all route parameters. */
  param(): object;
}

interface Redraw {
  /** Manually triggers an asynchronous redraw of mounted components. */
  (): void;
  /** Force Redraw */
  force(): void;
  /** Manually triggers a synchronous redraw of mounted components. */
  sync(): void;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
declare class Mithril {
  /** Global Window Object */
  static readonly window: Window & typeof globalThis;
  /** Renders a template to the DOM. */
  static render(element: Element, vnodes: Array<Component>): void;
  /** Activates a component, enabling it to autoredraw on user events */
  static mount(element: Element, component: Component): void;
  /** Navigate between "pages" within an application */
  static route: Route;
  /** Makes XHR (aka AJAX) requests, and returns a promise */
  static request: Http;
  /** Turns a string of the form ?a=1&b=2 to an object **/
  static buildQuerystring(string: string): object;
  /** Turns a string of the form ?a=1&b=2 to an object */
  static parseQuerystring(query: object): string;
  /** Turns a path template and a parameters object into a string of form /path/user?a=1&b=2 **/
  static buildPathname(path: string, query: object): string;
  /** Turns a string of the form /path/user?a=1&b=2 to an object **/
  static queryPathname(url: string): object;
  /** Turns an HTML or SVG string into unescaped HTML or SVG. Do not use m.trust on unsanitized user input. */
  static trust<T extends HTMLElement>(strings: string, ...values: string[]): T;
  /** Updates the DOM after a change in the application data layer. */
  static redraw: Redraw;
  /** Returns a shallow-cloned object with lifecycle attributes and any given custom attributes omitted. */
  static censor(object: object, values: string[]): object;
}

declare type Identity<T> = T;
declare const m: Identity<typeof Mithril> & Component;
declare module '@sin/mithril';

export {m as default};
