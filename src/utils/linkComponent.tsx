// packages/components/src/utils/linkComponent.tsx

/**
 * @fileoverview Link renderer injection
 * @description Components that render navigation (Card `href`) need the app router's link
 * (Next `Link`, react-router `Link`) for client-side navigation, but this layer cannot
 * import `@donotdev/ui`. `@donotdev/ui` registers its router link once in its providers;
 * without a provider, a plain `<a href>` is rendered (full page load, still crawlable).
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import { createContext, useContext } from 'react';
import type {
  AnchorHTMLAttributes,
  ComponentType,
  ReactElement,
  ReactNode,
} from 'react';

/** Props every link renderer receives: an anchor with a required href. */
export type LinkRendererProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

/** A component rendering a real `<a href>` (router-aware or plain). */
export type LinkRenderer = ComponentType<LinkRendererProps>;

function PlainAnchor(props: LinkRendererProps): ReactElement {
  return <a {...props} />;
}

const LinkRendererContext = createContext<LinkRenderer>(PlainAnchor);

/**
 * Provide the app router's link renderer to components of this package.
 * Mounted by `@donotdev/ui` providers; apps do not use it directly.
 *
 * @example
 * ```tsx
 * <LinkRendererProvider value={({ href, ...rest }) => <Link path={href} {...rest} />}>
 *   {children}
 * </LinkRendererProvider>
 * ```
 */
export const LinkRendererProvider = LinkRendererContext.Provider;

/**
 * The link renderer to use for `href` props: the router link when provided, else `<a>`.
 * @returns The current link renderer
 */
export function useLinkRenderer(): LinkRenderer {
  return useContext(LinkRendererContext);
}
