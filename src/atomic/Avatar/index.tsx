// packages/components/src/atomic/Avatar/index.tsx

/**
 * @fileoverview Avatar component
 * @description Accessible avatar component built on Radix UI primitives. Provides image and fallback support.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  AvatarPrimitive,
  AvatarImagePrimitive,
  AvatarFallbackPrimitive,
} from './AvatarPrimitive';

import type { ComponentProps } from 'react';

/** Props for the Avatar component. */
export interface AvatarProps extends ComponentProps<typeof AvatarPrimitive> {
  /** The URL of the avatar image */
  src?: string;
  /** The initials or text to display when image fails to load */
  fallback: string;
  /** Alt text for the image */
  alt?: string;
}

/**
 * Accessible avatar component built on Radix UI primitives. Provides image and fallback support.
 *
 * @component
 * @example
 * ```tsx
 * <Avatar src="https://github.com/shadcn.png" fallback="CN" />
 * ```
 * @param {AvatarProps} props - The props for the avatar
 * @returns {JSX.Element} The rendered avatar
 */
const Avatar = ({ src, fallback, alt, ...props }: AvatarProps) => {
  return (
    <AvatarPrimitive {...props}>
      <AvatarImagePrimitive src={src} alt={alt} />
      <AvatarFallbackPrimitive>{fallback}</AvatarFallbackPrimitive>
    </AvatarPrimitive>
  );
};

export default Avatar;
