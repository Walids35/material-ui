import { OverrideProps, Simplify } from '@mui/types';
import * as React from 'react';
import { ButtonUnstyledOwnProps } from '../ButtonUnstyled';
import { SlotComponentProps } from '../utils';
import { UseTabRootSlotProps } from '../useTab';

export interface TabUnstyledRootSlotPropsOverrides {}

export interface TabUnstyledOwnProps
  extends Omit<ButtonUnstyledOwnProps, 'onChange' | 'slots' | 'slotProps'> {
  /**
   * You can provide your own value. Otherwise, it falls back to the child position index.
   */
  value?: number | string;
  /**
   * Callback invoked when new value is being set.
   */
  onChange?: (event: React.SyntheticEvent, value: number | string) => void;
  /**
   * The props used for each slot inside the Tab.
   * @default {}
   */
  slotProps?: {
    root?: SlotComponentProps<'button', TabUnstyledRootSlotPropsOverrides, TabUnstyledOwnerState>;
  };
  /**
   * The components used for each slot inside the Tab.
   * Either a string to use a HTML element or a component.
   * @default {}
   */
  slots?: TabUnstyledSlots;
}

export interface TabUnstyledSlots {
  /**
   * The component that renders the root.
   * @default 'button'
   */
  root?: React.ElementType;
}

export type TabUnstyledProps<
  D extends React.ElementType = TabUnstyledTypeMap['defaultComponent'],
  P = {},
> = OverrideProps<TabUnstyledTypeMap<P, D>, D> & {
  component?: D;
};

export interface TabUnstyledTypeMap<P = {}, D extends React.ElementType = 'button'> {
  props: P & TabUnstyledOwnProps;
  defaultComponent: D;
}

export type TabUnstyledOwnerState = TabUnstyledProps & {
  active: boolean;
  disabled: boolean;
  highlighted: boolean;
  selected: boolean;
};

export type TabUnstyledRootSlotProps = Simplify<
  UseTabRootSlotProps & {
    className?: string;
    ref: React.Ref<any>;
    ownerState: TabUnstyledOwnerState;
  }
>;
