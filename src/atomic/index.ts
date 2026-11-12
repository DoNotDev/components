// packages/components/src/atomic/index.ts

/**
 * @fileoverview Atomic Components
 * @description Atomic UI components for DoNotDev framework
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

export { default as Accordion } from './Accordion';
export * from './Accordion/AccordionPrimitive';
export type { AccordionProps, AccordionItemType } from './Accordion';

export { default as Alert } from './Alert';
export { alertVariants, ALERT_VARIANT } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';

export { default as AlertDialog } from './AlertDialog';
export * from './AlertDialog/AlertDialogPrimitive';
export type { AlertDialogProps } from './AlertDialog';

export { default as ActionButton, useAction } from './ActionButton';
export type {
  ActionButtonProps,
  UseActionOptions,
  UseActionResult,
} from './ActionButton';

export { default as Avatar } from './Avatar';
export * from './Avatar/AvatarPrimitive';
export type { AvatarProps } from './Avatar';

export { default as Badge } from './Badge';
export { BADGE_VARIANT } from './Badge';
export type { BadgeProps, BadgeOwnProps, BadgeVariant } from './Badge';

export { default as Blockquote } from './Blockquote';
export { BLOCKQUOTE_VARIANT } from './Blockquote';
export type { BlockquoteProps, BlockquoteVariant } from './Blockquote';

export { default as Button } from './Button';
export { buttonVariants, BUTTON_VARIANT } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';

export { default as ButtonGroup } from './ButtonGroup';
export type { ButtonGroupProps, ButtonGroupItem } from './ButtonGroup';

export { default as CallToAction } from './CallToAction';
export type { CallToActionProps, CallToActionOwnProps } from './CallToAction';

export { default as Calendar } from './Calendar';
export type { CalendarProps } from './Calendar';
export * from './Calendar/CalendarPrimitive';

export { default as DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';

export { default as DateTimePicker } from './DateTimePicker';
export type { DateTimePickerProps } from './DateTimePicker';

export { default as Card, renderCardContent, renderCardHeader } from './Card';
export { CARD_VARIANT } from './Card';
export type {
  CardProps,
  CardVariant,
  CardContent,
  CardCoverImage,
  CardCoverMedia,
} from './Card';

export { default as DualCard } from './DualCard';
export type { DualCardProps, DualCardVariant } from './DualCard';

export { default as Checkbox } from './Checkbox';
export * from './Checkbox/CheckboxPrimitive';
export type { CheckboxProps } from './Checkbox';

export { default as Collapsible } from './Collapsible';
export * from './Collapsible/CollapsiblePrimitive';
export type { CollapsibleProps } from './Collapsible';

export { default as ColorPicker, COLOR_PRESETS } from './ColorPicker';
export type { ColorPickerProps, ColorSwatch, ColorPreset } from './ColorPicker';

export { default as Combobox, COMBOBOX_VARIANT } from './Combobox';
export type {
  ComboboxProps,
  ComboboxOption,
  ComboboxVariant,
} from './Combobox';

export { default as Command } from './Command';
export type { CommandProps, CommandItem, CommandGroup } from './Command';

export { default as CommandDialog } from './CommandDialog';
export type { CommandDialogProps } from './CommandDialog';

export { default as ContextMenu } from './ContextMenu';
export * from './ContextMenu/ContextMenuPrimitive';
export type { ContextMenuItemType, ContextMenuProps } from './ContextMenu';

export { default as CopyToClipboard } from './CopyToClipboard';
export type { CopyToClipboardProps } from './CopyToClipboard';

export { default as DescriptionList } from './DescriptionList';
export type { DescriptionListProps, DescriptionItem } from './DescriptionList';

export { default as Dialog, DIALOG_VARIANT } from './Dialog';
export * from './Dialog/DialogPrimitive';
export type {
  DialogProps,
  DialogContentProps,
  ContentSize,
  DialogVariant,
} from './Dialog';

export { default as DropdownMenu } from './DropdownMenu';
export * from './DropdownMenu/DropdownMenuPrimitive';
export type { DropdownMenuProps, DropdownMenuItemData } from './DropdownMenu';

export {
  default as FeatureFallback,
  withFeatureFallback,
  type FeatureFallbackProps,
} from './FeatureFallback';

export { default as FileButton } from './FileButton';
export type { FileButtonProps } from './FileButton';

export { default as Grid, GridArea } from './Grid';
export type {
  GridProps,
  GridOwnProps,
  GridAreaProps,
  GridAreaOwnProps,
  GridCols,
  ResponsiveCols,
  ResponsiveTemplate,
} from './Grid';

export { default as HeroSection } from './HeroSection';
export type { HeroSectionProps, HeroSectionOwnProps } from './HeroSection';

export { default as HoverCard } from './HoverCard';
export * from './HoverCard/HoverCardPrimitive';
export type { HoverCardProps } from './HoverCard';

export * from './Icons';

export { default as InfiniteScroll } from './InfiniteScroll';
export type { InfiniteScrollProps } from './InfiniteScroll';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Label, FloatingLabel } from './Label';
export * from './Label/LabelPrimitive';
export type { LabelProps, FloatingLabelProps } from './Label';

export { default as List } from './List';
export type { ListProps, ListItem } from './List';

export { default as NavigationMenu } from './NavigationMenu';
export * from './NavigationMenu/NavigationMenuPrimitive';
export type { NavigationMenuItem, NavigationMenuProps } from './NavigationMenu';

export { default as Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

export { default as PasswordInput } from './PasswordInput';
export type { PasswordInputProps } from './PasswordInput';

export { default as PinInput } from './PinInput';
export type { PinInputProps } from './PinInput';

export { default as Popover } from './Popover';
export { POPOVER_VARIANT } from './Popover';
export * from './Popover/PopoverPrimitive';
export type { PopoverProps } from './Popover';

export { default as Portal } from './Portal';
export * from './Portal/PortalPrimitive';
export type { PortalProps } from './Portal';

export { default as PortalButton } from './PortalButton';
export type { PortalButtonProps } from './PortalButton';

export { default as Progress } from './Progress';
export * from './Progress/ProgressPrimitive';
export type { ProgressProps } from './Progress';

export { default as RadioGroup } from './RadioGroup';
export * from './RadioGroup/RadioGroupPrimitive';
export type {
  RadioOption,
  RadioGroupProps,
  RadioGroupVariant,
} from './RadioGroup';

export { default as RangeInput } from './RangeInput';
export type { RangeInputProps } from './RangeInput';

export { default as Rating, RATING_VARIANT, ratingVariants } from './Rating';
export type { RatingProps, RatingVariant } from './Rating';

export { default as ScrollArea, ScrollBar } from './ScrollArea';
export * from './ScrollArea/ScrollAreaPrimitive';
export type { ScrollAreaProps, ScrollBarProps } from './ScrollArea';

export { default as Section } from './Section';
export type { SectionProps, SectionOwnProps } from './Section';

export {
  default as Select,
  SELECT_LABEL_VALUE,
  SELECT_SEPARATOR_VALUE,
} from './Select';
export type { SelectProps, SelectOption } from './Select';
export * from './Select/SelectPrimitive';

export { default as Separator } from './Separator';
export { SEPARATOR_VARIANT } from './Separator';
export * from './Separator/SeparatorPrimitive';
export type { SeparatorProps } from './Separator';

export { default as Sheet, SHEET_VARIANT } from './Sheet';
export * from './Sheet/SheetPrimitive';
export type { SheetProps, SheetVariant } from './Sheet';

export { default as Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { default as SkipLink } from './SkipLink';
export type { SkipLinkProps, SkipLinkItem } from './SkipLink';

export { default as Slider } from './Slider';
export * from './Slider/SliderPrimitive';
export type { SliderProps } from './Slider';

export { default as Slot } from './Slot';
export * from './Slot/SlotPrimitive';
export type { SlotProps } from './Slot';

export { default as Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { default as Stack, GAP_VARIANT } from './Stack';
export type { StackProps, StackOwnProps, GapVariant } from './Stack';

export { default as Stepper } from './Stepper';
export type { StepperProps, StepperStep } from './Stepper';

export { default as Switch } from './Switch';
export * from './Switch/SwitchPrimitive';
export type { SwitchProps } from './Switch';

export { default as Table } from './Table';
export { DataTable } from './Table';
export { parseCellText, parseClipboardGrid, setPendingCell } from './Table';
export type {
  TableColumn,
  DataTableProps,
  DataTableEditLabels,
  TableCellEdit,
  TableCellOption,
  TablePendingChanges,
} from './Table';

export { default as QuantityStepper } from './QuantityStepper';
export type { QuantityStepperProps } from './QuantityStepper';
export { default as Tag } from './Tag';
export { TAG_VARIANT, tagVariants } from './Tag';
export type { TagProps } from './Tag';

export { default as Tabs } from './Tabs';
export * from './Tabs/TabsPrimitive';
export type { TabsProps, TabItem } from './Tabs';

export { default as Text, TEXT_VARIANT } from './Text';
export { default as Typography } from './Text'; // MUI compatibility alias
export type { TextProps, TextOwnProps, TextVariant } from './Text';
export type { TextProps as TypographyProps } from './Text'; // MUI compatibility alias

export { default as Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { default as Toaster, ToastProvider, ToastAction } from './Toaster';
export * from './Toaster/ToastPrimitive';
export type { ToasterToast } from './Toaster';

export { default as Toggle, toggleVariants } from './Toggle';
export * from './Toggle/TogglePrimitive';
export type { ToggleProps } from './Toggle';

export { default as ToggleGroup } from './ToggleGroup';
export * from './ToggleGroup/ToggleGroupPrimitive';
export type { ToggleOption } from './ToggleGroup';

export { default as Tooltip, TooltipProvider } from './Tooltip';
export * from './Tooltip/TooltipPrimitive';
export type { TooltipProps } from './Tooltip';

export { default as TreeView } from './TreeView';
export type { TreeViewProps, TreeNode } from './TreeView';

export { default as VideoPlayer } from './VideoPlayer';
export type { VideoPlayerProps, VideoConfig } from './VideoPlayer';

export { default as VisuallyHidden } from './VisuallyHidden';
export type { VisuallyHiddenProps } from './VisuallyHidden';
export * from './VisuallyHidden/VisuallyHiddenPrimitive';
