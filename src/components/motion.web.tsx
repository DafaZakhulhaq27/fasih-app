import { useState, type ReactElement, type ReactNode } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { motion } from '@/theme';

import type {
  EnterAnimation,
  MotionStyle,
  MotionPressable as NativeMotionPressable,
  MotionText as NativeMotionText,
  MotionView as NativeMotionView,
  PressFeedback,
} from './motion';

// Web version of motion.tsx, with the same API on plain CSS through react-native-web's
// animation and transition style props. Browsers run these on the compositor, and the web bundle
// does not need Reanimated. react-native-web only compiles `animationKeyframes` inside
// StyleSheet.create, so the keyframes below are static styles and timing is added inline.

export const MotionView = View as unknown as typeof NativeMotionView;
export const MotionText = Text as unknown as typeof NativeMotionText;
export const MotionPressable = Pressable as unknown as typeof NativeMotionPressable;

const ms = (value: number): string => `${value}ms`;

const SLIDE = I18nManager.isRTL ? -24 : 24;

// `animationKeyframes` is a react-native-web style prop missing from React Native's types.
const keyframes = StyleSheet.create({
  fadeUp: {
    animationKeyframes: [
      {
        '0%': { opacity: 0, transform: `translateY(${motion.rise}px)` },
        '100%': { opacity: 1, transform: 'translateY(0px)' },
      },
    ],
  },
  popIn: {
    animationKeyframes: [
      {
        '0%': { opacity: 0, transform: 'scale(0.5)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
    ],
  },
  slideFromEnd: {
    animationKeyframes: [
      {
        '0%': { opacity: 0, transform: `translateX(${SLIDE}px)` },
        '100%': { opacity: 1, transform: 'translateX(0px)' },
      },
    ],
  },
  grow: {
    animationKeyframes: [{ '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } }],
  },
  write: {
    animationKeyframes: [{ '0%': { width: 0 }, '100%': { width: 116 } }],
  },
  shake: {
    animationKeyframes: [
      {
        '0%': { transform: 'translateX(0px)' },
        '20%': { transform: 'translateX(-6px)' },
        '40%': { transform: 'translateX(6px)' },
        '60%': { transform: 'translateX(-4px)' },
        '80%': { transform: 'translateX(4px)' },
        '100%': { transform: 'translateX(0px)' },
      },
    ],
  },
} as unknown as Record<EnterAnimation | 'shake', ViewStyle>);

export const growOrigin = I18nManager.isRTL ? 'right' : 'left';

// Press styles need :active, which inline styles cannot express, so one small stylesheet is
// added once; controls opt in through data-press.
const PRESS_STYLE_ID = 'fasih-press-feedback';
if (typeof document !== 'undefined' && !document.getElementById(PRESS_STYLE_ID)) {
  const sheet = document.createElement('style');
  sheet.id = PRESS_STYLE_ID;
  sheet.textContent = [
    `[data-press~="scale"]:active { transform: scale(${motion.pressScale}); }`,
    `[data-press~="dim"]:active { opacity: ${motion.pressDim}; }`,
  ].join('\n');
  document.head.appendChild(sheet);
}

export function usePressFeedback({
  dim = false,
  disabled = false,
}: { dim?: boolean; disabled?: boolean } = {}): PressFeedback {
  const reduce = useReduceMotion();
  if (disabled) {
    return { style: {} };
  }
  const press = [reduce ? null : 'scale', dim ? 'dim' : null].filter(Boolean).join(' ');
  return {
    style: reduce
      ? {}
      : {
          transitionProperty: 'transform, opacity',
          transitionDuration: ms(motion.press),
          transitionTimingFunction: motion.easeOut,
        },
    dataSet: press ? { press } : undefined,
  };
}

export function useStateTransition(
  properties: string[],
  duration: number = motion.state,
): MotionStyle {
  const reduce = useReduceMotion();
  return {
    transitionProperty: properties.map(cssProperty).join(', '),
    transitionDuration: ms(reduce ? 0 : duration),
    transitionTimingFunction: motion.easeOut,
  };
}

/** backgroundColor -> background-color, as CSS expects in transition-property. */
function cssProperty(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function useEnterAnimation(
  name: EnterAnimation,
  { delay = 0, duration = motion.enter }: { delay?: number; duration?: number } = {},
): MotionStyle | null {
  const reduce = useReduceMotion();
  const [animate] = useState(!reduce);
  if (!animate) {
    return null;
  }
  return [
    keyframes[name],
    {
      animationDuration: ms(duration),
      animationDelay: ms(delay),
      animationTimingFunction: motion.easeOut,
      animationFillMode: 'backwards',
    },
  ] as unknown as MotionStyle;
}

export function useShake(active: boolean): MotionStyle | null {
  const reduce = useReduceMotion();
  if (!active || reduce) {
    return null;
  }
  return [
    keyframes.shake,
    { animationDuration: ms(motion.enter), animationTimingFunction: motion.easeInOut },
  ] as unknown as MotionStyle;
}

type FadeUpProps = {
  index?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function FadeUp({ index = 0, delay, style, children }: FadeUpProps): ReactElement {
  const enter = useEnterAnimation('fadeUp', { delay: delay ?? index * motion.stagger });
  return <MotionView style={[style, enter]}>{children}</MotionView>;
}

export type { EnterAnimation, MotionStyle, PressFeedback };

// Fails to compile if this file's exports drift from motion.tsx.
void ({
  MotionView,
  MotionText,
  MotionPressable,
  growOrigin,
  usePressFeedback,
  useStateTransition,
  useEnterAnimation,
  useShake,
  FadeUp,
} satisfies typeof import('./motion'));
