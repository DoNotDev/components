// packages/components/src/atomic/PortalButton/index.tsx

/**
 * @fileoverview PortalButton component
 * @description Button component that renders in a portal (document.body) to avoid transform issues
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import Button, { type ButtonProps } from '../Button';
import Portal from '../Portal';

/** Props for the PortalButton component -- Button rendered in a portal to avoid transform issues. */
export interface PortalButtonProps extends ButtonProps {}

/**
 * PortalButton - Button component rendered in a portal
 *
 * Renders a Button component inside a Radix Portal to avoid transform/positioning issues.
 * Useful for floating buttons that need to stay fixed relative to viewport.
 *
 * @component
 * @example
 * ```tsx
 * <PortalButton icon={Bug} onClick={handleClick}>
 *   Debug Tools
 * </PortalButton>
 * ```
 *
 * @param {PortalButtonProps} props - The props for the portal button
 * @returns {JSX.Element} The rendered portal button
 */
const PortalButton = (props: PortalButtonProps) => {
  return (
    <Portal>
      <Button {...props} />
    </Portal>
  );
};

export default PortalButton;
