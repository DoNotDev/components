// packages/components/src/atomic/Avatar/AvatarPrimitive.tsx

/**
 * @fileoverview Avatar component
 * @description Accessible avatar component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixAvatar from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const AvatarPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAvatar.Root>) => (
  <RadixAvatar.Root className={cn('dndev-avatar', className)} {...props} />
);

const AvatarImagePrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAvatar.Image>) => (
  <RadixAvatar.Image
    className={cn('dndev-avatar-image', className)}
    {...props}
  />
);

const AvatarFallbackPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAvatar.Fallback>) => (
  <RadixAvatar.Fallback
    className={cn('dndev-avatar-fallback', className)}
    {...props}
  />
);

export { AvatarPrimitive, AvatarImagePrimitive, AvatarFallbackPrimitive };
