import React, { forwardRef, useRef } from 'react';
import { DefaultProps } from '@mantine/styles';
import { useUuid, useDidUpdate } from '@mantine/hooks';
import { Box } from '../Box';
import {
  AccordionItem,
  AccordionItemStylesNames,
  AccordionItemType,
  AccordionIconPosition,
} from './AccordionItem/AccordionItem';
import { useAccordionState, AccordionState } from './use-accordion-state/use-accordion-state';

export interface AccordionProps
  extends DefaultProps<AccordionItemStylesNames>,
    Omit<React.ComponentPropsWithRef<'div'>, 'onChange'> {
  /** <AccordionItem /> components only */
  children: React.ReactNode;

  /** Index of item which is initially opened (uncontrolled component) */
  initialItem?: number;

  /** Initial state (controls opened state of accordion items) for uncontrolled component */
  initialState?: AccordionState;

  /** Controlled state (controls opened state of accordion items) */
  state?: AccordionState;

  /** onChange handler for controlled component */
  onChange?(state: AccordionState): void;

  /** Allow multiple items to be opened at the same time */
  multiple?: boolean;

  /** Open/close item transition duration in ms */
  transitionDuration?: number;

  /** Used to connect accordion items controls to related content */
  id?: string;

  /** Replace icon on all items */
  icon?: React.ReactNode;

  /** Should icon rotation be disabled */
  disableIconRotation?: boolean;

  /** Change icon position: left or right */
  iconPosition?: AccordionIconPosition;
}

type AccordionComponent = ((props: AccordionProps) => React.ReactElement) & {
  displayName: string;
  Item: typeof AccordionItem;
};

export const Accordion: AccordionComponent = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      children,
      initialItem = -1,
      initialState,
      state,
      onChange,
      multiple = false,
      disableIconRotation = false,
      transitionDuration = 200,
      iconPosition = 'left',
      icon,
      classNames,
      styles,
      id,
      ...others
    }: AccordionProps,
    ref
  ) => {
    const uuid = useUuid(id);
    const controlsRefs = useRef<HTMLButtonElement[]>([]);
    const items = React.Children.toArray(children).filter(
      (item: AccordionItemType) => item.type === AccordionItem
    ) as AccordionItemType[];

    const [value, handlers] = useAccordionState({
      multiple,
      itemsCount: items.length,
      initialItem,
      state,
      initialState,
      onChange,
    });

    const handleItemKeydown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        const nextFocusElement = controlsRefs.current[index + 1];
        if (nextFocusElement) {
          nextFocusElement.focus();
        } else {
          controlsRefs.current[0]?.focus();
        }
      }

      if (event.code === 'ArrowUp') {
        event.preventDefault();
        const previousFocusElement = controlsRefs.current[index - 1];
        if (previousFocusElement) {
          previousFocusElement.focus();
        } else {
          controlsRefs.current[controlsRefs.current.length - 1]?.focus();
        }
      }
    };

    useDidUpdate(() => {
      controlsRefs.current = controlsRefs.current.slice(0, items.length);
    }, [items.length]);

    const controls = items.map((item, index) => (
      <AccordionItem
        {...item.props}
        icon={item.props.icon || icon}
        iconPosition={item.props.iconPosition || iconPosition}
        disableIconRotation={disableIconRotation}
        key={index}
        transitionDuration={transitionDuration}
        opened={value[index]}
        onToggle={() => handlers.toggle(index)}
        classNames={classNames}
        styles={styles}
        id={`${uuid}-${index}`}
        onKeyDown={(event) => handleItemKeydown(event, index)}
        controlRef={(node) => {
          controlsRefs.current[index] = node;
        }}
      />
    ));

    return (
      <Box ref={ref} {...others}>
        {controls}
      </Box>
    );
  }
) as any;

Accordion.Item = AccordionItem;

Accordion.displayName = '@mantine/core/Accordion';
