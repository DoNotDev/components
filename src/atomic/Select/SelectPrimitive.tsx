// packages/components/src/atomic/Select/SelectPrimitive.tsx

/**
 * @fileoverview Select Primitive
 * @description Low-level Radix UI select primitives, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SelectPrimitive from '@radix-ui/react-select';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const SelectRootPrimitive = SelectPrimitive.Root;

const SelectGroupPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Group>) => (
  <SelectPrimitive.Group className={cn(className)} {...props} />
);

const SelectValuePrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value className={cn(className)} {...props} />
);

const SelectTriggerPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger className={cn(className)} {...props} />
);

const SelectContentPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Content className={cn(className)} {...props} />
);

const SelectLabelPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label className={cn(className)} {...props} />
);

const SelectItemPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item className={cn(className)} {...props} />
);

const SelectSeparatorPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator className={cn(className)} {...props} />
);

const SelectItemTextPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ItemText>) => (
  <SelectPrimitive.ItemText className={cn(className)} {...props} />
);

const SelectPortalPrimitive = SelectPrimitive.Portal;
const SelectViewportPrimitive = SelectPrimitive.Viewport;
const SelectIconPrimitive = SelectPrimitive.Icon;
const SelectItemIndicatorPrimitive = SelectPrimitive.ItemIndicator;

export { SelectRootPrimitive as SelectPrimitive };
export {
  SelectGroupPrimitive,
  SelectValuePrimitive,
  SelectTriggerPrimitive,
  SelectContentPrimitive,
  SelectPortalPrimitive,
  SelectViewportPrimitive,
  SelectLabelPrimitive,
  SelectItemPrimitive,
  SelectItemTextPrimitive,
  SelectItemIndicatorPrimitive,
  SelectIconPrimitive,
  SelectSeparatorPrimitive,
};
