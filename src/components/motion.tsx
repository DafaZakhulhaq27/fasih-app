import { useState, type ComponentType, type ReactElement, type ReactNode } from 'react';
import {
  I18nManager,
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, { css, type CSSKeyframesRule } from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/use-reduce-motion';
import { motion } from '@/theme';

// Shared motion for iOS and Android: Reanimated CSS animations and transitions, which run on the
// UI thread. The web build uses motion.web.tsx instead, with the same API on plain CSS, so
// Reanimated (about 670 KB of JavaScript) stays out of the web bundle.

/**
 * Animation and transition props on top of a normal style. Values are loose on purpose: the
 * native file passes them to Reanimated, the web file to react-native-web, and each checks them.
 */
export type MotionStyle = {
  transitionProperty?: string | string[];
  transitionDuration?: string;
  transitionTimingFunction?: string;
  animationName?: unknown;
  animationDuration?: string;
  animationDelay?: string;
  animationTimingFunction?: string;
  animationFillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  /** A plain transform, or per-state values such as { default, ':active' } on native. */
  transform?: unknown;
  opacity?: unknown;
};

type MotionViewProps = Omit<ViewProps, 'style'> & { style?: StyleProp<ViewStyle | MotionStyle> };
type MotionTextProps = Omit<TextProps, 'style'> & { style?: StyleProp<TextStyle | MotionStyle> };
type MotionPressableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle | MotionStyle>;
  /** Web only: data-* attributes the press styles hook into. */
  dataSet?: Record<string, string>;
};

// The casts widen the style prop to MotionStyle; Reanimated validates the values at runtime.
export const MotionView = Animated.View as unknown as ComponentType<MotionViewProps>;
export const MotionText = Animated.Text as unknown as ComponentType<MotionTextProps>;
export const MotionPressable = Animated.createAnimatedComponent(
  Pressable,
) as unknown as ComponentType<MotionPressableProps>;

const ms = (value: number): string => `${value}ms`;

const SLIDE = 24;

/** One-off animations, by name, so both platforms define the same set. */
const keyframes = {
  /** Fades in while rising `motion.rise` points into place. */
  fadeUp: css.keyframes({
    from: { opacity: 0, transform: [{ translateY: motion.rise }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  }),
  /** Scales up from small, for marks that appear in place (a check). */
  popIn: css.keyframes({
    from: { opacity: 0, transform: [{ scale: 0.5 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
  }),
  /** Arrives from the end side, like turning to the next page. */
  slideFromEnd: css.keyframes({
    from: { opacity: 0, transform: [{ translateX: I18nManager.isRTL ? -SLIDE : SLIDE }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  }),
  /** Grows along its width; pair with `growOrigin`. */
  grow: css.keyframes({
    from: { transform: [{ scaleX: 0 }] },
    to: { transform: [{ scaleX: 1 }] },
  }),
  /** Reveals a 116pt-wide pen stroke from the start (the wordmark underline). */
  write: css.keyframes({ from: { width: 0 }, to: { width: 116 } }),
} satisfies Record<string, CSSKeyframesRule>;

export type EnterAnimation = keyof typeof keyframes;

/** Where a `grow` animation starts from: the start edge in the current writing direction. */
export const growOrigin = I18nManager.isRTL ? 'right' : 'left';

const shake = css.keyframes({
  '0%': { transform: [{ translateX: 0 }] },
  '20%': { transform: [{ translateX: -6 }] },
  '40%': { transform: [{ translateX: 6 }] },
  '60%': { transform: [{ translateX: -4 }] },
  '80%': { transform: [{ translateX: 4 }] },
  '100%': { transform: [{ translateX: 0 }] },
});

export type PressFeedback = { style: MotionStyle; dataSet?: Record<string, string> };

/**
 * Press feedback from the ':active' state, so holding a control does not re-render it: a slight
 * shrink, and optionally a dim. Under Reduce Motion only the dim is kept; disabled controls get
 * none (the pressed style would override their disabled look).
 */
export function usePressFeedback({
  dim = false,
  disabled = false,
}: { dim?: boolean; disabled?: boolean } = {}): PressFeedback {
  const reduce = useReduceMotion();
  if (disabled) {
    return { style: {} };
  }
  const opacity = dim ? { opacity: { default: 1, ':active': motion.pressDim } } : {};
  if (reduce) {
    return { style: opacity };
  }
  return {
    style: {
      ...opacity,
      transform: { default: [{ scale: 1 }], ':active': [{ scale: motion.pressScale }] },
      transitionProperty: ['transform', 'opacity'],
      transitionDuration: ms(motion.press),
      transitionTimingFunction: motion.easeOut,
    },
  };
}

/** Transitions the given style properties when they change; instant under Reduce Motion. */
export function useStateTransition(
  properties: string[],
  duration: number = motion.state,
): MotionStyle {
  const reduce = useReduceMotion();
  return {
    transitionProperty: properties,
    transitionDuration: ms(reduce ? 0 : duration),
    transitionTimingFunction: motion.easeOut,
  };
}

/**
 * Plays a one-off animation when the component mounts. Decided once, at mount, so turning
 * Reduce Motion off later never replays it.
 */
export function useEnterAnimation(
  name: EnterAnimation,
  { delay = 0, duration = motion.enter }: { delay?: number; duration?: number } = {},
): MotionStyle | null {
  const reduce = useReduceMotion();
  const [animate] = useState(!reduce);
  if (!animate) {
    return null;
  }
  return {
    animationName: keyframes[name],
    animationDuration: ms(duration),
    animationDelay: ms(delay),
    animationTimingFunction: motion.easeOut,
    // Hold the first frame during the delay, so staggered items do not flash in first.
    animationFillMode: 'backwards',
  };
}

/** A short side-to-side shake while `active`, e.g. for a wrong answer. Null under Reduce Motion. */
export function useShake(active: boolean): MotionStyle | null {
  const reduce = useReduceMotion();
  if (!active || reduce) {
    return null;
  }
  return {
    animationName: shake,
    animationDuration: ms(motion.enter),
    animationTimingFunction: motion.easeInOut,
  };
}

type FadeUpProps = {
  /** Position in a group arriving together; each step waits `motion.stagger` longer. */
  index?: number;
  /** A fixed wait in milliseconds instead of the stagger, for a beat after other content. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Content that fades in and rises into place once, when it first appears. */
export function FadeUp({ index = 0, delay, style, children }: FadeUpProps): ReactElement {
  const enter = useEnterAnimation('fadeUp', { delay: delay ?? index * motion.stagger });
  return <MotionView style={[style, enter]}>{children}</MotionView>;
}
