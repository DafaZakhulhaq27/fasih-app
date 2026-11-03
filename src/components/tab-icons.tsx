import type { ReactElement } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

// Outline icons for the tab bar (docs/design/screens/02-main.png), 24pt with a 1.75 stroke.

type IconProps = { color: ColorValue };

const stroke = {
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

export function TodayIcon({ color }: IconProps): ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={5} y={3.5} width={14} height={17} rx={2} stroke={color} {...stroke} />
      <Path d="M9 3.5v17M12 8h4M12 11.5h4" stroke={color} {...stroke} />
    </Svg>
  );
}

export function LearnIcon({ color }: IconProps): ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2zM12 6.5v13"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

export function PracticeIcon({ color }: IconProps): ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M15.5 4.5l4 4L9 19H5v-4L15.5 4.5zM13 7l4 4" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ReviewIcon({ color }: IconProps): ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={4.5} y={8} width={12} height={12} rx={2} stroke={color} {...stroke} />
      <Path d="M8 4.5h9.5a2 2 0 0 1 2 2V16" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ProgressIcon({ color }: IconProps): ReactElement {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 19.5h16M4 13.5l4.5-3 3.5 2.5 4.5-5L20 10" stroke={color} {...stroke} />
    </Svg>
  );
}
